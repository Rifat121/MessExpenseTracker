const Expense = require("../models/Expense");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

exports.getExpenseSummary = asyncHandler(async (req, res) => {
  const { messId, userId } = req.params;

  const totalExpenses = await Expense.aggregate([
    { $match: { messId: messId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const userExpenses = await Expense.aggregate([
    { $match: { messId: messId, payer: userId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const mess = await Mess.findById(messId);
  const memberCount = mess.members.length;

  const total = totalExpenses[0]?.total || 0;
  const userContribution = userExpenses[0]?.total || 0;
  const userShare = total / memberCount;
  const balance = userContribution - userShare;

  res.json({
    totalExpenses: total,
    userContribution: userContribution,
    userShare: userShare,
    balance: balance,
  });
});