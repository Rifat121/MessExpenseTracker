const mongoose = require("mongoose");
const FixedExpenses = require("../models/FixedExpenses");
const Expense = require("../models/Expense");
const Mess = require("../models/Mess");
const User = require("../models/User");
const { getMealSummary } = require("../services/mealSummaryService");

// GET /mess/:id/members
exports.getMessMembers = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id).populate(
      "members",
      "name email messId isAdmin"
    );
    if (!mess) return res.status(404).json({ message: "Mess not found" });
    res.json(mess.members);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /mess/:id/swap-admin
exports.swapAdmin = async (req, res) => {
  const { newAdminId } = req.body;
  const messId = req.params.id;

  try {
    // Find the mess
    const mess = await Mess.findById(messId);
    if (!mess) {
      return res.status(404).json({ message: "Mess not found" });
    }

    // Check if the new admin is a member of the mess
    if (!mess.members.includes(newAdminId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this mess." });
    }

    // Check if the current admin is performing the swap
    const currentAdmin = await User.findById(mess.admin);
    if (!currentAdmin) {
      return res.status(404).json({ message: "Current admin not found." });
    }

    // Only current admin can swap the admin role
    if (!currentAdmin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only the current admin can swap admin." });
    }

    // Swap the admin in the mess document
    mess.admin = newAdminId; // Update the admin field in the mess schema
    await mess.save();

    // Update the `isAdmin` flag for users in the mess
    await User.updateMany({ mess: messId }, { $set: { isAdmin: false } }); // Reset all members' `isAdmin`
    await User.findByIdAndUpdate(newAdminId, { isAdmin: true }); // Set the new admin

    res.json({ message: "Admin swapped successfully." });
  } catch (err) {
    console.error("Swap Admin Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

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
