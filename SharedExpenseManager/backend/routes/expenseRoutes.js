const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();
const {protect} = require('../middleware/authMiddleware');

// POST /api/expenses/submit
router.post('/submit', protect, async (req, res) => {
  try {
    const {amount, category, payer} = req.body;

    const newExpense = new Expense({
      amount,
      category,
      payer,
      status: 'pending', // Expense starts as "pending"
    });

    await newExpense.save();
    res.status(201).json({message: 'Expense submitted successfully'});
  } catch (error) {
    res.status(500).json({message: 'Server Error', error});
  }
});

// PUT /api/expenses/approve/:id
router.put('/approve/:id', async (req, res) => {
  try {
    const {status} = req.body; // Expected values: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({message: 'Invalid status value'});
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {approved: status === 'approved'},
      {new: true},
    );

    if (!updatedExpense) {
      return res.status(404).json({message: 'Expense not found'});
    }

    res.json({
      message: `Expense ${status} successfully`,
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({message: 'Server Error', error});
  }
});
  

// 🟢 Add a New Expense
router.post('/add', async (req, res) => {
  try {
    const {amount, category, payer} = req.body;
    const newExpense = new Expense({amount, category, payer});

    await newExpense.save();
    res.status(201).json({message: 'Expense added successfully'});
  } catch (error) {
    res.status(500).json({message: 'Server Error', error});
  }
});

// 🟢 Get All Expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('payer', 'name email');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({message: 'Server Error', error});
  }
});

module.exports = router;
