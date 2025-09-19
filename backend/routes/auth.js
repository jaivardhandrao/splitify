const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const auth = require('../middleware/auth');
const router = express.Router();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// GET /api/auth/me - Get logged-in user info
router.get('/me', auth, async (req, res) => {
  res.json({ id: req.user._id, email: req.user.email, name: req.user.name, phone: req.user.phone });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required fields' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User exists' });

    user = new User({ email, password, name, phone });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const url = `${process.env.FRONTEND_URL}/verify/${token}`;

    const msg = {
      to: email,
      from: 'splitify.mail@gmail.com', // Replace with verified SendGrid sender
      subject: `Welcome to Splitify! Verify Your Email to Get Started`,
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
          <p style="font-size: 12px; color: #666;">If you didn’t sign up, ignore this email.</p>
          <p style="font-size: 12px; color: #666;">Questions? Contact support@splitify.com.</p>
          <p style="font-size: 11px; color: #999; margin-top: 20px;"><strong>Unsubscribe:</strong> <a href="mailto:splitify.mail@gmail.com?subject=Unsubscribe Splitify" style="color: #10b981;">click here</a>.</p>
          <div style="text-align: center; margin-top: 30px; padding: 10px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">© 2025 Splitify. All rights reserved.</div>
        </body></html>
      `
    };

    await sgMail.send(msg);

    res.status(201).json({ message: 'Email sent! Check your inbox (and spam folder) for the verification link.' });
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

    const msg = {
      to: email,
      from: 'splitify.mail@gmail.com', // Replace with verified SendGrid sender
      subject: `Splitify Password Reset - Secure Link Inside`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset Your Splitify Password</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #10b981; margin: 0;">Password Reset Request</h1>
            <p style="font-size: 16px; margin: 10px 0;">Hi ${user.name || 'User'},</p>
          </div>
          <p>We received a request to reset your Splitify password. If you didn’t request this, ignore this email.</p>
          <p>To reset your password, click below. This link expires in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy this link: <span style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all;">${url}</span></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">If you didn’t request a reset, no action is needed.</p>
          <p style="font-size: 12px; color: #666;">Questions? Reply to this email.</p>
          <p style="font-size: 11px; color: #999; margin-top: 20px;"><strong>Unsubscribe:</strong> <a href="mailto:splitify.mail@gmail.com?subject=Unsubscribe Splitify" style="color: #10b981;">click here</a>.</p>
          <div style="text-align: center; margin-top: 30px; padding: 10px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">© 2025 Splitify. All rights reserved.</div>
        </body></html>
      `
    };

    await sgMail.send(msg);

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Token generated:', token); // Debug
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, phone: user.phone } });
  } catch (error) {
    console.error('Login error:', error.message, error.stack); // Enhanced logging
    res.status(500).json({ error: 'Server error during login: ' + error.message });
  }
});

module.exports = router;