const express = require('express');
const router = express.Router(); // This acts like a mini-app just for auth routes
const bcrypt = require('bcryptjs'); // Tool to scramble passwords
const jwt = require('jsonwebtoken'); // Tool to create digital ID cards
const User = require('../models/User'); // Import our User model

// Purpose: To create a digital ID token (JWT)
// Takes the user's ID and signs it with our secret key. It expires in 30 days.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    // 1. Get the data the user typed in the frontend form
    const { name, email, password, facility, role } = req.body;

    // 2. Check if the user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Scramble (Hash) the password so hackers can't read it
    const salt = await bcrypt.genSalt(10); // Generates random characters to mix in
    const hashedPassword = await bcrypt.hash(password, salt); // Mixes them with the password

    // 4. Create the new user in the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Save the scrambled password, not the real one!
      facility,
      role
    });

    // 5. Send back a success response with the new user data and their digital token
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id) // Give them their ID card!
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by their email
    const user = await User.findOne({ email });

    // 2. Check if user exists AND if the typed password matches the saved scrambled password
    if (user && (await bcrypt.compare(password, user.password))) {
      // 3. Passwords match! Send back their data and a new token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      // 4. Passwords don't match, or user doesn't exist
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
