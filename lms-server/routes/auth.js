const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateJWT } = require('../middleware/auth');

// Helper: send email using shared utility
const { sendEmail } = require('../utils/email');

function sendServerError(res, err, context) {
  console.error(`${context}:`, err);
  return res.status(500).json({ message: 'Server error' });
}

// Login route
router.post('/login', async (req, res) => {
  const { email, regNumber, password } = req.body;
  try {
    if ((!email && !regNumber) || !password) {
      return res.status(400).json({ message: 'Email or registration number and password are required' });
    }
    const user = await User.findOne({
      $or: [
        { email: email || undefined },
        { registrationNumber: regNumber || undefined }
      ]
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, role: user.role, registrationNumber: user.registrationNumber },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
        role: user.role
      }
    });
  } catch (err) {
    sendServerError(res, err, 'Auth route error')
  }
});

// Register route (for students)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const registrationNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      registrationNumber,
      role: 'student',
      emailVerified: true
    });
    res.status(201).json({ message: 'Registration successful', registrationNumber });
  } catch (err) {
    sendServerError(res, err, 'Auth route error')
  }
});

// Forgot password (send OTP)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    await sendEmail(email, 'LMS Password Reset OTP', `Your OTP is: ${otp}`);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    sendServerError(res, err, 'Auth route error')
  }
});

// Reset password (with OTP)
router.post('/reset-password', async (req, res) => {
  const { regNumber, otp, newPassword } = req.body;
  try {
    if (!regNumber || !otp || !newPassword) {
      return res.status(400).json({ message: 'Registration number, OTP and new password are required' });
    }
    const user = await User.findOne({ registrationNumber: regNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    sendServerError(res, err, 'Auth route error')
  }
});

// Change password (for logged-in user)
router.post('/change-password', authenticateJWT, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    sendServerError(res, err, 'Auth route error')
  }
});

module.exports = router; 