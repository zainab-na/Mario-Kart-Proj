const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@123';

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'mk_secret_change_me', { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    if (!firstName || !lastName || !age || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: Number(age),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'user'
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/email and password are required.' });
    }

    if (identifier === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = signToken({
        id: 'admin',
        role: 'admin',
        email: 'admin@mariokart.local',
        name: 'Admin User'
      });

      return res.json({
        message: 'Admin login successful.',
        token,
        role: 'admin',
        user: {
          id: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@mariokart.local',
          role: 'admin'
        }
      });
    }

    const user = await User.findOne({ email: identifier.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });

    return res.json({
      message: 'Login successful.',
      token,
      role: user.role,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  if (req.user.id === 'admin') {
    return res.json({
      id: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@mariokart.local',
      role: 'admin'
    });
  }

  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json(user);
});

router.get('/users', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  return res.json(users);
});

module.exports = router;
