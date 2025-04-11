const mongoose = require("mongoose");

const MealEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: "Mess", required: true },
  date: { type: Date, required: true },
  mealCount: { type: Number, required: true },
});

MealEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("MealEntry", MealEntrySchema);
