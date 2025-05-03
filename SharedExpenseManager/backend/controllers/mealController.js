const mongoose = require("mongoose");
const MealEntry = require("../models/MealEntry");
const FixedExpenses = require("../models/FixedExpenses");
const Expense = require("../models/Expense");
const User = require("../models/User");

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

exports.getMealRate = async (req, res) => {
  const { messId } = req.params;
  const { month } = req.query;
  const { start, end } = getDateRange(month);

  try {
    const messObjectId = new mongoose.Types.ObjectId(messId);

    const [meals, fixed, users, recentExpenses] = await Promise.all([
      MealEntry.find({ messId: messObjectId, date: { $gte: start, $lt: end } }),
      FixedExpenses.findOne({ messId: messObjectId }),
      User.find({ messId: messObjectId }, "name"),
      Expense.aggregate([
        {
          $match: {
            messId: messObjectId,
            date: { $gte: start, $lt: end },
            approved: true,
            category: { $in: ["Groceries", "Utilities"] },
          },
        },
        { $group: { _id: "$payer", total: { $sum: "$amount" } } },
      ]),
    ]);

    const userExpenseMap = new Map(
      recentExpenses.map(({ _id, total }) => [_id.toString(), total])
    );
    const memberMap = new Map();
    users.forEach((user) => {
      const userId = user._id.toString();
      memberMap.set(userId, {
        name: user.name,
        totalMeals: 0,
        expense: userExpenseMap.get(userId) || 0,
      });
    });

    let totalMeals = 0;
    meals.forEach((meal) => {
      const userId = meal.userId?.toString();
      if (userId && memberMap.has(userId)) {
        memberMap.get(userId).totalMeals += meal.mealCount;
        totalMeals += meal.mealCount;
      }
    });

    const fixedTotal = Object.entries(fixed?.toObject() || {})
      .filter(
        ([key, val]) =>
          typeof val === "number" &&
          ![
            "_id",
            "messId",
            "updatedBy",
            "createdAt",
            "updatedAt",
            "__v",
          ].includes(key)
      )
      .reduce((sum, [, val]) => sum + val, 0);

    const utilityTotal = recentExpenses[1]?.total || 0;
    const fixedSharePerMember = memberMap.size
      ? (fixedTotal + utilityTotal) / memberMap.size
      : 0;

    const mealExpense = recentExpenses[0]?.total || 0;
    const mealRate = totalMeals ? mealExpense / totalMeals : 0;

    const members = [...memberMap.entries()].map(([userId, data]) => {
      const mealCost = data.totalMeals * mealRate;
      const totalDue = fixedSharePerMember + mealCost - data.expense;
      return {
        userId,
        name: data.name,
        totalMeals: data.totalMeals,
        mealCost: mealCost.toFixed(2),
        fixedShare: fixedSharePerMember.toFixed(2),
        userExpense: data.expense,
        totalDue: totalDue.toFixed(2),
      };
    });

    res.json({
      totalMeals,
      totalMealExpense: mealExpense.toFixed(2),
      fixedExpense: fixedTotal.toFixed(2),
      mealRate: mealRate.toFixed(2),
      members,
    });
  } catch (err) {
    console.error("Error in meal summary route:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
