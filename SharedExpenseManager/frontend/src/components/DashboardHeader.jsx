import React from 'react';
import MealFormCard from "../pages/MealFormCard";

const DashboardHeader = ({ mess, user, handleLogout, handleNavigateToAdminDashboard, setShowMealForm, showMealForm, token }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="text-red-500 text-sm font-semibold hover:underline"
        >
          Logout
        </button>
      </div>
      {user.isAdmin && (
        <button
          onClick={handleNavigateToAdminDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Admin Dashboard
        </button>
      )}

      <h2 className="text-xl font-bold mb-2">{mess.name}</h2>
      <p className="text-gray-700">👥 Members: {mess.members?.length || 1}</p>
      <p className="text-gray-700">📅 Period: April 2025</p>
      <p className="text-gray-700">
        👑 Admin: {user.isAdmin ? "You" : "N/A"}
      </p>

      <div className="mb-4 mt-2">
        <button
          onClick={() => setShowMealForm(!showMealForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showMealForm ? "Hide Meal Entry" : "Add Meal Entry"}
        </button>
      </div>

      {showMealForm && (
        <div className="w-full max-w-md mx-auto">
          <MealFormCard setShowMealForm={setShowMealForm} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;