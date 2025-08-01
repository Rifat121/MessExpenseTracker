const express = require("express");
const Expense = require("../models/Expense");
const asyncHandler = require("express-async-handler");

const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

// PUT /api/expenses/approve/:id
router.put("/approve/:id", asyncHandler(async (req, res) => {
  const { status } = req.body; // Expected values: 'approved' or 'rejected'

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    req.params.id,
    { approved: status === "approved" },
    { new: true }
  );

  if (!updatedExpense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  res.json({
    message: `Expense ${status} successfully`,
    expense: updatedExpense,
  });
}));

// POST /api/expenses/add
router.post("/add", protect, asyncHandler(async (req, res) => {
  const { amount, category, date } = req.body;

  if (!amount || !category) {
    res.status(400);
    throw new Error("Amount and category are required");
  }

  if (!req.user.messId) {
    res.status(400);
    throw new Error("User is not part of a mess");
  }

  const user = await User.findById(req.user._id);

  const newExpense = new Expense({
    amount,
    category,
    messId: user.messId,
    payer: user._id,
    date: date || new Date(),
    approved: user.isAdmin, // auto-approve if admin
  });

  await newExpense.save();
  res
    .status(201)
    .json({ message: "Expense added successfully", expense: newExpense });
}));

// 🟢 Get Recent Expenses for a specific mess
router.get("/recent/:messId", protect, asyncHandler(async (req, res) => {
  const { messId } = req.params;

  const expenses = await Expense.find({ messId })
    .populate("payer", "name email")
    .sort({ date: -1 })
    .limit(10);

  res.json(expenses);
}));

module.exports = router;
