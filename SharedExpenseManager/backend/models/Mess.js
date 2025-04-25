const mongoose = require("mongoose");

const MessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// TODO: Update this schema to hold admin id field in the db. currently not storing

module.exports = mongoose.model("Mess", MessSchema);
