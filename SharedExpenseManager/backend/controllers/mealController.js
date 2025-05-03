const mongoose = require("mongoose");
const MealEntry = require("../models/MealEntry");
const FixedExpenses = require("../models/FixedExpenses");
const Expense = require("../models/Expense");
const User = require("../models/User");

// POST /meals/addMeal
exports.addOrUpdateMeal = async (req, res) => {
  const { date, mealCount } = req.body;
  const userId = req.user._id;
  const messId = req.user.messId;

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

// GET /meals/:messId?month=YYYY-MM
exports.getMealsByMess = async (req, res) => {
  const { messId } = req.params;
  const { month } = req.query;

  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

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

// GET /meals/user/:userId?month=YYYY-MM
exports.getMealsByUser = async (req, res) => {
  const { userId } = req.params;
  const { month } = req.query;

  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

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

// Skipping this for now
// GET /meals/summary/:messId?month=YYYY-MM
exports.getMealSummary = async (req, res) => {
  const { messId } = req.params;
  const { month } = req.query;

  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  try {
    const [meals, fixed, users] = await Promise.all([
      MealEntry.find({ messId, date: { $gte: start, $lt: end } }),
      FixedExpenses.findOne({ messId }),
      User.find({ messId }, "name"),
    ]);

    const memberMap = new Map();
    users.forEach((user) =>
      memberMap.set(user._id.toString(), { name: user.name, totalMeals: 0 })
    );

    let totalMeals = 0;

    for (let meal of meals) {
      const userId = meal.userId.toString();
      if (memberMap.has(userId)) {
        memberMap.get(userId).totalMeals += meal.mealCount;
        totalMeals += meal.mealCount;
      }
    }

    const fixedTotal =
      (fixed?.bill || 0) + (fixed?.rent || 0) + (fixed?.maid || 0);

    const memberCount = users.length;
    const messTotalExpense = await calculateTotalExpenses(messId, start, end); // Placeholder for other expenses
    const mealExpense = messTotalExpense - fixedTotal;
    const mealRate = totalMeals > 0 ? (mealExpense / totalMeals).toFixed(2) : 0;

    const members = [...memberMap].map(([userId, data]) => ({
      userId,
      name: data.name,
      totalMeals: data.totalMeals,
      mealCost: (data.totalMeals * mealRate).toFixed(2),
    }));

    res.json({
      totalMeals,
      totalMealExpense: mealExpense.toFixed(2),
      mealRate,
      members,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /meals/summary/:messId?month=YYYY-MM
exports.getMealRate = async (req, res) => {
  const { messId } = req.params;
  const { month } = req.query;

  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  try {
    const messObjectId = new mongoose.mongo.ObjectId(messId);
    console.log("Mess ID:", messObjectId);
    console.log("Month range:", start.toISOString(), "-", end.toISOString());

    const [meals, fixed, users, recentExpenses] = await Promise.all([
      MealEntry.find({
        messId: messObjectId,
        date: { $gte: start, $lt: end },
      }),
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
        {
          $group: {
            _id: "$payer",
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);
    const userExpenseMap = new Map();
    recentExpenses.forEach(({ _id, total }) => {
      userExpenseMap.set(_id.toString(), total);
    });

    const memberMap = new Map();
    users.forEach((user) => {
      const userId = user._id.toString();
      const totalExpense = userExpenseMap.get(userId) || 0;

      memberMap.set(userId, {
        name: user.name,
        totalMeals: 0,
        expense: totalExpense,
      });
    });

    let totalMeals = 0;
    for (const meal of meals) {
      const userId = meal.userId?.toString?.();
      if (!userId) {
        console.warn("Missing userId on meal:", meal);
        continue;
      }

      if (memberMap.has(userId)) {
        const userData = memberMap.get(userId);
        userData.totalMeals += meal.mealCount;
        totalMeals += meal.mealCount;
      } else {
        console.warn("Meal entry userId not found in memberMap:", userId);
      }
    }

    let fixedTotal = 0;
    if (fixed) {
      const ignoreFields = [
        "_id",
        "messId",
        "updatedBy",
        "createdAt",
        "updatedAt",
        "__v",
      ];
      const fixedObj = fixed.toObject();
      for (const key in fixedObj) {
        if (!ignoreFields.includes(key) && typeof fixedObj[key] === "number") {
          fixedTotal += fixedObj[key];
        }
      }
    }

    const utilityTotal = recentExpenses[1]?.total || 0;
    const totalFixedAndUtility = fixedTotal + utilityTotal;
    const fixedSharePerMember =
      memberMap.size > 0
        ? (totalFixedAndUtility / memberMap.size).toFixed(2)
        : 0;

    const mealExpense = recentExpenses[0]?.total || 0;
    const mealRate = totalMeals > 0 ? (mealExpense / totalMeals).toFixed(2) : 0;

    const members = [...memberMap].map(([userId, data]) => {
      console.log(data);
      const mealCost = data.totalMeals * mealRate;
      const totalDue =
        parseFloat(fixedSharePerMember) + mealCost - data.expense;

      return {
        userId,
        name: data.name,
        totalMeals: data.totalMeals,
        mealCost: mealCost.toFixed(2),
        fixedShare: fixedSharePerMember,
        userExpense: data.expense,
        totalDue: totalDue.toFixed(2),
      };
    });

    console.log("Total meals:", totalMeals);
    console.log("Meal rate:", mealRate);
    console.log("Members summary:", members);

    res.json({
      totalMeals,
      totalMealExpense: mealExpense.toFixed(2),
      fixedExpense: fixedTotal.toFixed(2),
      mealRate,
      members,
    });
  } catch (err) {
    console.error("Error in meal summary route:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
