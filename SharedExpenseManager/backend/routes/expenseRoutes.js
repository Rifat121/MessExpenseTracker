const express = require("express");
const Expense = require("../models/Expense");

const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

// PUT /api/expenses/approve/:id
router.put("/approve/:id", async (req, res) => {
  try {
    const { status } = req.body; // Expected values: 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { approved: status === "approved" },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({
      message: `Expense ${status} successfully`,
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// POST /api/expenses/add
router.post("/add", protect, async (req, res) => {
  try {
    const { amount, category, date } = req.body;

    if (!amount || !category) {
      return res
        .status(400)
        .json({ message: "Amount and category are required" });
    }

    if (!req.user.messId) {
      return res.status(400).json({ message: "User is not part of a mess" });
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
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🟢 Get Recent Expenses for a specific mess
router.get("/recent/:messId", protect, async (req, res) => {
  const { messId } = req.params;

  try {
    const expenses = await Expense.find({ messId })
      .populate("payer", "name email")
      .sort({ date: -1 })
      .limit(10);

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
