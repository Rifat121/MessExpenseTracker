const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("express-async-handler");
const config = require('../config');

const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
  const userId = user._id;
  const isApproved = user.isApproved;
  const isAdmin = user.isAdmin;
  const messId = user.messId;

  return jwt.sign(
    { userId, isApproved, isAdmin, messId },
    config.jwtSecret,
    { expiresIn: "1d" }
  );
};

// 🟢 Register a New User
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password, mobile } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const newUser = new User({ name, email, password, mobile });
  await newUser.save();

  res.status(201).json({ message: "User registered successfully" });
}));

// 🟢 User Login
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
      messId: user.messId,
      isAdmin: user.isAdmin,
      isApproved: user.isApproved,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
}));

router.get("/me", protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
}));

// 🟢 Get All Users
router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

module.exports = router;
