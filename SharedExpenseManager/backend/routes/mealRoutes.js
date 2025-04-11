const express = require("express");
const router = express.Router();
const {
  addOrUpdateMeal,
  getMealsByMess,
  getMealsByUser,
  getMealSummary,
} = require("../controllers/mealController");

const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post("/", protect, addOrUpdateMeal);
router.get("/:messId", protect, isAdmin, getMealsByMess);
router.get("/user/:userId", protect, getMealsByUser);
router.get("/summary/:messId", protect, isAdmin, getMealSummary);

module.exports = router;
