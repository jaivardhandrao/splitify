const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  // Ensure this is your App Password, not regular password
  },
  // Enhanced config for better deliverability and to reduce spam/unsafe flags
  secure: true,  // Use TLS encryption
  tls: {
    rejectUnauthorized: false  // For development; set to true in production for security
  },
  // Set a friendly sender name to improve reputation and reduce spam score
  from: `"Splitify Team" <${process.env.EMAIL_USER}>`
});

// GET /api/auth/me - Get logged-in user info
router.get('/me', auth, async (req, res) => {
  res.json({ id: req.user._id, email: req.user.email, name: req.user.name, phone: req.user.phone });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required fields' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User exists' });

    user = new User({ email, password, name, phone });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const url = `https://your-app-url.com/verify/${token}`;  // Use HTTPS in production; replace with your domain (localhost for dev)
    
    // Improved email content: Full HTML template to reduce spam score (descriptive, structured, with unsubscribe)
    const mailOptions = {
      to: email,
      subject: `Welcome to Splitify! Verify Your Email to Get Started`,  // Descriptive subject to avoid spam filters
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Splitify Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #10b981; margin: 0;">Welcome to Splitify! 🚀</h1>
            <p style="font-size: 16px; margin: 10px 0;">Hi ${name},</p>
          </div>
          <p>Thank you for signing up with Splitify – the easiest way to split expenses with friends!</p>
          <p>To complete your registration and start using the app, please verify your email address by clicking the button below. This helps us keep your account secure.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" 
               style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              Verify My Email
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all;">${url}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">If you didn't create a Splitify account, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #666;">Questions? Reply to this email or contact support@splitify.com.</p>
          <p style="font-size: 11px; color: #999; margin-top: 20px;">
            <strong>Unsubscribe:</strong> If you no longer wish to receive these emails, 
            <a href="mailto:${process.env.EMAIL_USER}?subject=Unsubscribe Splitify" style="color: #10b981;">click here</a>.
          </p>
          <div style="text-align: center; margin-top: 30px; padding: 10px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">
            © 2025 Splitify. All rights reserved. | Made with ❤️ for easy expense splitting.
          </div>
        </body>
        </html>
      `,
      // Anti-spam headers to improve deliverability and reduce "unsafe" flags
      headers: {
        'X-Mailer': 'Splitify Verification Service',  // Identifies sender
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`,  // Compliance for CAN-SPAM
        'Precedence': 'bulk',  // Marks as transactional
        'Auto-Submitted': 'auto-generated'  // Indicates automated email
      }
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Email sent! Check your inbox (and spam folder) for the verification link.' });
  } catch (error) {
    console.error('Email error:', error);  // Log for debugging
    res.status(500).json({ error: 'Failed to send email. Please try again.' });  // Better error message
  }
});

router.post('/verify/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.isVerified) return res.status(400).json({ error: 'Invalid or already verified token' });

    user.isVerified = true;
    await user.save();
    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token. Please register again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(400).json({ error: 'Invalid credentials' });
    if (!user.isVerified) return res.status(400).json({ error: 'Please verify your email first' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, phone: user.phone } });  // Include more user info
  } catch (error) {
    console.error('Login error:', error);  // Log for debugging
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;