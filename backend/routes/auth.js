const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// GET /api/auth/me - Get logged-in user info
router.get('/me', auth, async (req, res) => {
    res.json({ id: req.user._id, email: req.user.email, name: req.user.name, phone: req.user.phone });
    // res.json({ id: req.user._id, email: req.user.email, name: req.user.name, phone: req.user.phone });
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
    const url = `http://localhost:5173/verify/${token}`;
    await transporter.sendMail({ to: email, subject: 'Verify', html: `<a href="${url}">Verify</a>` });

    res.status(201).json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Erroreabafa' });
  }
});

router.post('/verify/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.isVerified) return res.status(400).json({ error: 'Invalid' });

    user.isVerified = true;
    await user.save();
    res.json({ message: 'Verified' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(400).json({ error: 'Invalid' });
    if (!user.isVerified) return res.status(400).json({ error: 'Verify first' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

module.exports = router;