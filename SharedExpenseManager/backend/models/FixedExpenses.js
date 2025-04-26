const mongoose = require('mongoose');

const FixedExpensesSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    electricity_bill: { type: Number, default: 0 },
    gas_bill: { type: Number, default: 0 },
    internet_bill: { type: Number, default: 0 },
    rent: { type: Number, default: 0 },
    maid: { type: Number, default: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FixedExpenses', FixedExpensesSchema);
