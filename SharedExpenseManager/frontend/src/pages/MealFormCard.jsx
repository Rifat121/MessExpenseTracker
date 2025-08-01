import React, { useState } from "react";
import api from "../api/api";

const MealFormCard = ({ token, setShowMealForm }) => {
  const [mealCount, setMealCount] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (mealCount <= 0) {
      setMessageType("error");
      setMessage("Mealcount should be a positive number");
      return;
    }
    try {
      const payload = {
        mealCount: Number(mealCount),
        date,
      };

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const res = await api.post("/api/meals/addMeal", payload);

      setMessage("✅ Meal entry submitted successfully!");
      setMessageType("success");

      setMealCount("");
      setDate(new Date().toISOString().split("T")[0]);
      setTimeout(() => {
        setShowMealForm(false);
        if (onUpdate) onUpdate();
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "❌ Failed to submit meal entry.";
      setMessage(errorMsg);
      setMessageType("error");
    }
  };

  return (
    <form
      onSubmit={handleMealSubmit}
      className="mt-6 space-y-4 bg-white p-6 rounded-2xl shadow-md"
    >
      {message && (
        <div
          className={`text-sm px-4 py-2 rounded flex items-center justify-between ${
            messageType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <span>{message}</span>
          <button
            onClick={() => setMessage("")}
            className="ml-4 font-bold focus:outline-none"
          >
            ×
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meal Count
        </label>
        <input
          type="number"
          value={mealCount}
          onChange={(e) => setMealCount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Enter number of meals"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        Submit Meal Count
      </button>
    </form>
  );
};

export default MealFormCard;
