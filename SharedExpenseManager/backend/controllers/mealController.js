const MealEntry = require('../models/MealEntry');
const FixedExpenses = require('../models/FixedExpenses');
const User = require('../models/User');

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
    res.status(500).json({ message: 'Server error', error: err.message });
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
      date: { $gte: start, $lt: end }
    }).populate('userId', 'name');
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
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
      date: { $gte: start, $lt: end }
    }).sort({ date: 1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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
      User.find({ messId }, 'name')
    ]);

    const memberMap = new Map();
    users.forEach(user => memberMap.set(user._id.toString(), { name: user.name, totalMeals: 0 }));

    let totalMeals = 0;

    for (let meal of meals) {
      const userId = meal.userId.toString();
      if (memberMap.has(userId)) {
        memberMap.get(userId).totalMeals += meal.mealCount;
        totalMeals += meal.mealCount;
      }
    }

    const fixedTotal = (fixed?.bill || 0) + (fixed?.rent || 0) + (fixed?.maid || 0);

    const memberCount = users.length;
    const messTotalExpense = await calculateTotalExpenses(messId, start, end); // Placeholder for other expenses
    const mealExpense = messTotalExpense - fixedTotal;
    const mealRate = totalMeals > 0 ? (mealExpense / totalMeals).toFixed(2) : 0;

    const members = [...memberMap].map(([userId, data]) => ({
      userId,
      name: data.name,
      totalMeals: data.totalMeals,
      mealCost: (data.totalMeals * mealRate).toFixed(2)
    }));

    res.json({
      totalMeals,
      totalMealExpense: mealExpense.toFixed(2),
      mealRate,
      members
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// NOTE: This function should fetch total variable expenses.
// For now, mock this or implement based on how you track personal/shared expenses.
const calculateTotalExpenses = async (messId, start, end) => {
  // This should eventually sum all non-fixed expenses (e.g., shared groceries etc.)
  return 10000; // Mock total for now
};
