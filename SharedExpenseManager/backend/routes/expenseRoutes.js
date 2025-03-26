const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();

// POST /api/expenses/submit
router.post('/submit', async (req, res) => {
  try {
    const {amount, description, userId} = req.body;

    const newExpense = new Expense({
      amount,
      description,
      userId,
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
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({message: 'Expense not found'});

    expense.status = 'approved'; // or 'rejected'
    await expense.save();

    res.status(200).json({message: 'Expense approved successfully'});
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
