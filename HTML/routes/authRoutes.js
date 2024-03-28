const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();

router.post('/signup', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  // Check if the password is at least 8 characters long
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  // Check if email already exists
  User.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        // If email is already in use, return a message
        return res.status(400).json({ message: 'Email already in use' });
      }

      // If email is not in use, create a new user
      const newUser = new User({
        email,
        passwordHash: password, // This will be hashed by the pre-save hook
        profileInfo: {
          firstName,
          lastName,
        }
      });
      // Save the new user
      return newUser.save();
    })
    .then(() => res.status(201).json({ message: 'User created successfully' }))
    .catch(error => res.status(500).json({ error: error.message }));
});


// Login Endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        throw new Error('Invalid credentials');
      }
      return bcrypt.compare(password, user.passwordHash)
        .then(isMatch => {
          if (!isMatch) {
            throw new Error('Invalid credentials');
          }
          // Session creation here
          req.session.userId = user._id;
          res.status(200).json({ message: 'Login successful', redirectUrl: '/chat.html' });
        });
    })
    .catch(error => res.status(401).json({ message: error.message }));
});

// Logout Endpoint
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Error in session destruction');
      }
      res.status(200).json({ message: 'Logout successful', redirectUrl: '/login.html' });
    });
  }
});

router.get('/session-check', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ sessionActive: true });
  } else {
    res.json({ sessionActive: false });
  }
});

module.exports = router;
