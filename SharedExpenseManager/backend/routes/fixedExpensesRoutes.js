const express = require("express");
const router = express.Router();
const {
  getFixedExpenses,
  updateFixedExpenses,
} = require("../controllers/fixedExpensesController");
const { protect } = require("../middleware/authMiddleware"); // Will add `isAdmin` later

router.get("/:messId", protect, getFixedExpenses);
router.put("/:messId", protect, updateFixedExpenses); // Will add `isAdmin` later

module.exports = router;
