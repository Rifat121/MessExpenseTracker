// services/mealSummaryService.js

const MealEntry = require("../models/MealEntry");
const User = require("../models/User");

exports.getMealSummary = async (messId, start, end) => {
  const meals = await MealEntry.find({
    messId,
    date: { $gte: start, $lt: end },
  });
  const users = await User.find({ messId }, "name");

  const memberMap = new Map();
  users.forEach((user) => {
    memberMap.set(user._id.toString(), {
      name: user.name,
      totalMeals: 0,
    });
  });

  let totalMeals = 0;
  meals.forEach((meal) => {
    const userId = meal.userId?.toString();
    if (memberMap.has(userId)) {
      const member = memberMap.get(userId);
      member.totalMeals += meal.mealCount;
      totalMeals += meal.mealCount;
    }
  });

  return {
    totalMeals,
    memberMap,
  };
};
