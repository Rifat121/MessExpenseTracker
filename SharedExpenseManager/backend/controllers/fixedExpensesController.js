const FixedExpenses = require("../models/FixedExpenses");

// GET /fixed-expenses/:messId
exports.getFixedExpenses = async (req, res) => {
  try {
    const expense = await FixedExpenses.findOne({ messId: req.params.messId });
    if (!expense)
      return res.status(404).json({ message: "No fixed expenses found." });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /fixed-expenses/:messId
exports.updateFixedExpenses = async (req, res) => {
  const { bill, rent, maid } = req.body;
  try {
    const updated = await FixedExpenses.findOneAndUpdate(
      { messId: req.params.messId },
      {
        bill,
        rent,
        maid,
        updatedBy: req.user._id,
      },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
