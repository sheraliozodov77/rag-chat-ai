import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

const router = express.Router();

// Signup Endpoint
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      passwordHash,
      profileInfo: {
        firstName,
        lastName,
      },
    });

    // Save the new user
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user._id;
    res.status(200).json({ message: 'Login successful', redirectUrl: '/chat.html' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout Endpoint
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error in session destruction');
      }
      res.status(200).json({ message: 'Logout successful', redirectUrl: '/login.html' });
    });
  } else {
    res.status(200).json({ message: 'No active session found' });
  }
});

// Session Check Endpoint
router.get('/session-check', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ sessionActive: true });
  } else {
    res.json({ sessionActive: false });
  }
});

export default router;
