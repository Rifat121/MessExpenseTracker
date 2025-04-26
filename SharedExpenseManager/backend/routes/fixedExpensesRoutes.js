const express = require("express");
const router = express.Router();
const {
  getFixedExpenses,
  updateFixedExpenses,
} = require("../controllers/fixedExpensesController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.get("/:messId", protect, getFixedExpenses);
router.put("/:messId", protect, isAdmin, updateFixedExpenses);

module.exports = router;
