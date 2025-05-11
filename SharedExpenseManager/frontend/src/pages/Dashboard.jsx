import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import FixedExpensesCard from "./FixedExpensesCard";
import RecentExpensesCard from "./RecentExpensesCard";
import MealFormCard from "./MealFormCard";
import MessSummaryCard from "./MessSummaryCard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [mess, setMess] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);
  const [shouldReloadSummary, setShouldReloadSummary] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const handleNavigateToAdminDashboard = () => {
    if (user.isAdmin) {
      navigate("/admin-dashboard", { state: { user } });
    }
  };

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const userRes = await api.get("/api/users/me", {
          headers,
        });
        setUser(userRes.data);

        const { messId, _id: userId } = userRes.data;

        const messRes = await api.get(`/api/mess/${messId}`, { headers });
        setMess(messRes.data);
      } catch (err) {
        console.error(
          "Error loading dashboard data:",
          err.response?.data || err.message
        );
      }
    };

    fetchData();
  }, [token]);

  if (!user || !mess) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* 🏠 Mess Info */}
      <div className="bg-white rounded-2xl shadow-md p-6 relative">
        {/* 🔓 Logout Button in Top-Right */}
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

        {/* 🍽️ Meal Count Form */}
        <div className="mb-4 mt-2">
          <button
            onClick={() => setShowMealForm(!showMealForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {showMealForm ? "Hide Meal Entry" : "Add Meal Entry"}
          </button>
        </div>

        {/* Conditionally render the form */}
        {showMealForm && (
          <div className="w-full max-w-md mx-auto">
            <MealFormCard
              token={token}
              setShowMealForm={setShowMealForm}
              setShouldReloadSummary={setShouldReloadSummary}
            />
          </div>
        )}
      </div>

      {/* 💸 Expense Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-lg font-bold">৳8,000</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Your Contribution</p>
          <p className="text-lg font-bold">৳2,500</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Your Share</p>
          <p className="text-lg font-bold">৳2,000</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Balance</p>
          <p className="text-lg font-bold text-green-700">+৳500</p>
        </div>
      </div>

      {/* 📝 Recent Expenses */}
      <RecentExpensesCard
        user={user}
        setShouldReloadSummary={setShouldReloadSummary}
      />

      <FixedExpensesCard
        messId={mess._id}
        user={user}
        setShouldReloadSummary={setShouldReloadSummary}
      />

      {/* 🧮 Split Summary */}
      <MessSummaryCard
        messId={mess._id}
        shouldReloadSummary={shouldReloadSummary}
        setShouldReloadSummary={setShouldReloadSummary}
      />
    </div>
  );
};

export default Dashboard;
