const mongoose = require("mongoose");
const FixedExpenses = require("../models/FixedExpenses");
const Expense = require("../models/Expense");
const Mess = require("../models/Mess");
const User = require("../models/User");
const { getMealSummary } = require("../services/mealSummaryService");

const asyncHandler = require("express-async-handler");

// GET /mess/:id/members
exports.getMessMembers = asyncHandler(async (req, res) => {
  const mess = await Mess.findById(req.params.id).populate(
    "members",
    "name email messId isAdmin"
  );
  if (!mess) {
    res.status(404);
    throw new Error("Mess not found");
  }
  res.json(mess.members);
});

const { validateAdminSwap } = require("../services/messService");

// PATCH /mess/:id/swap-admin
exports.swapAdmin = asyncHandler(async (req, res) => {
  const { newAdminId } = req.body;
  const messId = req.params.id;
  const currentAdminId = req.user._id;

  const mess = await validateAdminSwap(messId, newAdminId, currentAdminId);

  mess.admin = newAdminId;
  await mess.save();

  await User.updateMany({ mess: messId }, { $set: { isAdmin: false } });
  await User.findByIdAndUpdate(newAdminId, { isAdmin: true });

  res.json({ message: "Admin swapped successfully." });
});

// GET /mess/summary/:messId?month=YYYY-MM
exports.getMessSummary = async (req, res) => {
  try {
    const { messId } = req.params;
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const start = new Date(`${month}-01`);
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
    const messObjectId = new mongoose.Types.ObjectId(messId);

    // Encapsulate data fetching
    const data = await fetchMessData(messObjectId, start, end);

    // Process the data
    const summary = calculateMessSummary(data, month);

    res.json(summary);
  } catch (err) {
    console.error("Error in getMessSummary:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

function calculateFixedTotal(fixedDoc) {
  if (!fixedDoc) return 0;

  const ignore = [
    "_id",
    "messId",
    "updatedBy",
    "createdAt",
    "updatedAt",
    "__v",
  ];
  return Object.entries(fixedDoc.toObject()).reduce((sum, [key, value]) => {
    return !ignore.includes(key) && typeof value === "number"
      ? sum + value
      : sum;
  }, 0);
}

function buildMembers(users, memberMap, userExpenses, mealRate, fixedShare) {
  const members = [];

  users.forEach((user) => {
    const id = user._id.toString();
    const data = memberMap.get(id) || { name: user.name, totalMeals: 0 };
    const expense = userExpenses.get(id) || 0;

    const mealCost = data.totalMeals * mealRate;
    const totalDue = fixedShare + mealCost - expense;

    members.push({
      userId: id,
      name: data.name,
      totalMeals: data.totalMeals,
      mealCost: mealCost.toFixed(2),
      fixedShare: fixedShare.toFixed(2),
      userExpense: expense.toFixed(2),
      totalDue: totalDue.toFixed(2),
    });
  });

  return members;
}
// Helper function to fetch all required data
async function fetchMessData(messId, start, end) {
  const expenseQuery = {
    messId,
    date: { $gte: start, $lt: end },
    approved: true,
    category: { $in: ["Groceries", "Utilities"] },
  };

  return Promise.all([
    getMealSummary(messId, start, end),
    FixedExpenses.findOne({ messId }),
    User.find({ messId }, "name"),
    Expense.aggregate([
      { $match: expenseQuery },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: expenseQuery },
      { $group: { _id: "$payer", total: { $sum: "$amount" } } },
    ]),
  ]);
}

// Helper function to process the data and calculate the summary
function calculateMessSummary(
  [mealSummary, fixed, users, categoryExpenses, payerExpenses],
  month
) {
  const { totalMeals, memberMap } = mealSummary;
  const memberCount = memberMap.size;

  // Create Maps from expense data to match original code's expectations
  const categoryMap = new Map();
  categoryExpenses.forEach(({ _id, total }) => {
    categoryMap.set(_id.toString(), total);
  });

  const payerExpenseMap = new Map();
  payerExpenses.forEach(({ _id, total }) => {
    payerExpenseMap.set(_id.toString(), total);
  });

  // Calculate totals
  const fixedTotal = calculateFixedTotal(fixed);
  const utilityTotal = categoryMap.get("Utilities") || 0;
  const mealExpense = categoryMap.get("Groceries") || 0;

  const totalFixedAndUtility = fixedTotal + utilityTotal;
  const fixedShare = memberCount ? totalFixedAndUtility / memberCount : 0;
  const mealRate = totalMeals > 0 ? mealExpense / totalMeals : 0;

  // Build member details using original Map structure
  const members = buildMembers(
    users,
    memberMap,
    payerExpenseMap,
    mealRate,
    fixedShare
  );

  return {
    month,
    totalMeals,
    mealRate: mealRate.toFixed(2),
    mealExpense: mealExpense.toFixed(2),
    fixedExpense: fixedTotal.toFixed(2),
    utilityExpense: utilityTotal.toFixed(2),
    members,
  };
}
