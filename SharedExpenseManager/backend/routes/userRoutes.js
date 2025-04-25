const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🟢 Register a New User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ name, email, password, mobile });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 🟢 User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        messId: user.messId,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error); // 🔴 Log the error
    res.status(500).json({ message: "Server Error", error });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in /api/user/me:", err);
    res.status(500).json({ message: "Server error" });
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
