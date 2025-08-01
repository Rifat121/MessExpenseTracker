const Expense = require("../models/Expense");
const User = require("../models/User");
const Mess = require("../models/Mess");
const FixedExpenses = require("../models/FixedExpenses");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

exports.getExpenseSummary = asyncHandler(async (req, res) => {
  const { messId, userId } = req.params;

  const objectMessId = new mongoose.Types.ObjectId(messId);
  const objectUserId = new mongoose.Types.ObjectId(userId);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Calculate total expenses from Expense model for current month
  const monthlyExpenses = await Expense.aggregate([
    { $match: {
        messId: objectMessId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
    } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Get fixed expenses for the mess
  const fixedExpensesDoc = await FixedExpenses.findOne({ messId: objectMessId });
  const fixedExpensesTotal = fixedExpensesDoc ? (
    fixedExpensesDoc.electricity_bill +
    fixedExpensesDoc.gas_bill +
    fixedExpensesDoc.internet_bill +
    fixedExpensesDoc.rent +
    fixedExpensesDoc.maid
  ) : 0;

  const total = (monthlyExpenses[0]?.total || 0) + fixedExpensesTotal;

  // Calculate user's contribution from Expense model for current month
  const userMonthlyExpenses = await Expense.aggregate([
    { $match: {
        messId: objectMessId,
        payer: objectUserId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
    } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const userContribution = userMonthlyExpenses[0]?.total || 0;

  const mess = await Mess.findById(objectMessId);
  const memberCount = mess.members.length;

  const userShare = total / memberCount;
  const balance = userContribution - userShare;

  res.json({
    totalExpenses: total,
    userContribution: userContribution,
    userShare: userShare,
    balance: balance,
  });
});