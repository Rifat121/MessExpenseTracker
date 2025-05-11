const express = require("express");
const router = express.Router();
const {
  addOrUpdateMeal,
  getMealsByMess,
  getMealsByUser,
  // getMealSummary,
  getMealRate
} = require("../controllers/mealController");

const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post("/addMeal", protect, addOrUpdateMeal);
router.get("/:messId", protect, isAdmin, getMealsByMess);
router.get("/user/:userId", protect, getMealsByUser);
router.get("/summary/:messId", protect, getMealRate); // we have this method too for sample -> getMealSummary;

module.exports = router;
