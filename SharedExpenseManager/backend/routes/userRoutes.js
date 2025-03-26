const express = require('express');
const User = require('../models/User');

const router = express.Router();

// 🟢 Register a New User
router.post('/register', async (req, res) => {
  try {
    const {name, email, password} = req.body;
    const userExists = await User.findOne({email});

    if (userExists)
      return res.status(400).json({message: 'User already exists'});

    const newUser = new User({name, email, password});
    await newUser.save();

    res.status(201).json({message: 'User registered successfully'});
  } catch (error) {
    res.status(500).json({message: 'Server Error', error});
  }
});

// 🟢 Get All Users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({message: 'Server Error', error});
  }
});

module.exports = router;
