const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const { OAuth2Client } = require('google-auth-library');
const auth = require('../middleware/auth');
const router = express.Router();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// GET /api/auth/me - Get logged-in user info
router.get('/me', auth, async (req, res) => {
  res.json({ id: req.user._id, email: req.user.email, name: req.user.name, phone: req.user.phone, upiId: req.user.upiId });
});

// PUT /api/auth/profile - Update user profile (name and phone only, email is locked)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Update only name and phone (email is locked for security)
    req.user.name = name;
    req.user.phone = phone;

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,  // Return email but it wasn't changed
        phone: req.user.phone
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/auth/upi - Update user UPI ID
router.put('/upi', auth, async (req, res) => {
  try {
    const { upiId } = req.body;

    // Basic UPI ID validation (format: xxx@xxx)
    if (upiId && !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      return res.status(400).json({ error: 'Invalid UPI ID format. Should be like yourname@bank' });
    }

    req.user.upiId = upiId || '';
    await req.user.save();

    res.json({
      message: 'UPI ID updated successfully',
      upiId: req.user.upiId
    });
  } catch (error) {
    console.error('UPI update error:', error);
    res.status(500).json({ error: 'Failed to update UPI ID' });
  }
});

// GET /api/auth/user/:userId/upi - Get user's UPI ID (for payments within groups)
router.get('/user/:userId/upi', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email upiId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      name: user.name, 
      email: user.email,
      upiId: user.upiId 
    });
  } catch (error) {
    console.error('Get UPI error:', error);
    res.status(500).json({ error: 'Failed to fetch UPI ID' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name || !phone) return res.status(400).json({ error: 'Required fields' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User exists' });

    user = new User({ email, password, name, phone });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });
    const url = `${process.env.FRONTEND_URL}/verify/${token}`;
    
    console.log('🔍 DEBUG: Attempting to send email from:', process.env.EMAIL_FROM);
    console.log('🔍 DEBUG: Sending to:', email);

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Splitify! Verify Your Email to Get Started',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verify Your Splitify Account</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
      <h1 style="color: #10b981; margin: 0;">Welcome to Splitify! 🚀</h1>
      <p style="font-size: 16px; margin: 10px 0;">Hi ${name},</p>
      </div>
      <p>Thank you for signing up with Splitify – the easiest way to split expenses with friends!</p>
      <p>To complete your registration, please verify your email by clicking below.</p>
      <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">Verify My Email</a>
      </div>
      <p style="font-size: 14px; color: #666;">Or copy this link: <span style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all;">${url}</span></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">If you didn't sign up, ignore this email.</p>
      <p style="font-size: 12px; color: #666;">Questions? Contact support@splitify.com.</p>
      <div style="text-align: center; margin-top: 30px; padding: 10px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">© 2025 Splitify. All rights reserved.</div>
      </body></html>
      `
    });

    res.status(201).json({ message: 'Email sent! Check your inbox (and spam folder) for the verification link.' });

    await user.save();

  } catch (error) {

    console.error('Email error:', error);

    res.status(500).json({ error: 'Failed to send email. Please try again.' });
    
  }
});


// POST /api/auth/verify/:token - Verify email with token
router.post('/verify/:token', async (req, res) => {
  try {
    console.log('Verification attempt for token:', req.params.token);
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.isVerified) {
      console.log('Token invalid or user already verified:', decoded.id);
      return res.status(400).json({ error: 'Invalid or already verified token' });
    }

    user.isVerified = true;
    await user.save();
    console.log('User verified successfully:', decoded.id);
    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    if (error.name === 'TokenExpiredError') {
      res.status(400).json({ error: 'Token expired. Please request a new verification link.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(400).json({ error: 'Invalid token. Please request a new verification link.' });
    } else {
      res.status(500).json({ error: 'Server error during verification.' });
    }
  }
});

// POST /api/auth/forgot-password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No account found with that email' });

    const token = jwt.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Splitify Password Reset - Secure Link Inside',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset Your Splitify Password</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #10b981; margin: 0;">Password Reset Request</h1>
            <p style="font-size: 16px; margin: 10px 0;">Hi ${user.name || 'User'},</p>
          </div>
          <p>We received a request to reset your Splitify password. If you didn't request this, ignore this email.</p>
          <p>To reset your password, click below. This link expires in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy this link: <span style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all;">${url}</span></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">If you didn't request a reset, no action is needed.</p>
          <p style="font-size: 12px; color: #666;">Questions? Reply to this email.</p>
          <div style="text-align: center; margin-top: 30px; padding: 10px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">© 2025 Splitify. All rights reserved.</div>
        </body></html>
      `
    });

    res.status(200).json({ message: 'Password reset link sent! Check your email (and spam folder).' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
  }
});

// POST /api/auth/reset-password/:token - Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'New password required' });

    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (decoded.type !== 'reset') return res.status(400).json({ error: 'Invalid token type' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ error: 'User not found' });

    user.password = password; // Hashing handled by User model pre-save
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(400).json({ error: 'Token expired. Request a new reset link.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(400).json({ error: 'Invalid token. Request a new reset link.' });
    } else {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password.' });
    }
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email); // Debug
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No'); // Debug
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const passwordMatch = await user.comparePassword(password);
    console.log('Password match:', passwordMatch); // Debug
    if (!passwordMatch) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.isVerified) return res.status(400).json({ error: 'Please verify your email first' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15d' });
    console.log('Token generated:', token); // Debug
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, phone: user.phone } });
  } catch (error) {
    console.error('Login error:', error.message, error.stack); // Enhanced logging
    res.status(500).json({ error: 'Server error during login: ' + error.message });
  }
});

// POST /api/auth/google - Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log('Google Sign-In attempt for:', email);

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Existing user - update if needed
      if (!user.googleId && user.authProvider === 'local') {
        // Link Google account to existing local account
        user.googleId = googleId;
        user.profilePicture = picture;
        user.isVerified = true; // Auto-verify via Google
        await user.save();
        console.log('Linked Google account to existing user:', email);
      }
    } else {
      // New user - create account
      user = new User({
        email,
        name,
        phone: '', // Optional for Google users
        googleId,
        authProvider: 'google',
        profilePicture: picture,
        isVerified: true, // Auto-verify Google users
      });
      await user.save();
      console.log('Created new Google user:', email);
    }

    // Generate JWT token (same as normal login)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

module.exports = router;