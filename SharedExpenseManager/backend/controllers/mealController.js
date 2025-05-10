const mongoose = require("mongoose");
const MealEntry = require("../models/MealEntry");
const FixedExpenses = require("../models/FixedExpenses");
const Expense = require("../models/Expense");
const User = require("../models/User");
const { getMealSummary } = require("../services/mealSummaryService");

exports.addOrUpdateMeal = async (req, res) => {
  const { date, mealCount } = req.body;
  const { _id: userId, messId } = req.user;

  try {
    const updated = await MealEntry.findOneAndUpdate(
      { userId, date },
      { userId, messId, date, mealCount },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getDateRange = (month) => {
  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);
  return { start, end };
};

exports.getMealsByMess = async (req, res) => {
  const { messId } = req.params;
  const { month } = req.query;
  const { start, end } = getDateRange(month);

  try {
    const meals = await MealEntry.find({
      messId,
      date: { $gte: start, $lt: end },
    }).populate("userId", "name");
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getMealsByUser = async (req, res) => {
  const { userId } = req.params;
  const { month } = req.query;
  const { start, end } = getDateRange(month);

  try {
    const meals = await MealEntry.find({
      userId,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /meals/rate/:messId?month=YYYY-MM
exports.getMealRate = async (req, res) => {
  const { messId } = req.params;
  const { month } = req.query;

  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  try {
    const messObjectId = new mongoose.Types.ObjectId(messId);

    const [mealSummary, groceryExpense] = await Promise.all([
      getMealSummary(messObjectId, start, end),
      Expense.aggregate([
        {
          $match: {
            messId: messObjectId,
            date: { $gte: start, $lt: end },
            approved: true,
            category: "Groceries",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const totalMeals = mealSummary.totalMeals || 0;
    const totalGrocery = groceryExpense[0]?.total || 0;
    const mealRate =
      totalMeals > 0 ? (totalGrocery / totalMeals).toFixed(2) : "0.00";

    res.json({ totalMeals, totalGrocery, mealRate });
  } catch (err) {
    console.error("Error calculating meal rate:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
