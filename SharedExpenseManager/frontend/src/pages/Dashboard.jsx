import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthService from "../services/AuthService";
import api from "../api/api";
import FixedExpensesCard from "./FixedExpensesCard";
import RecentExpensesCard from "./RecentExpensesCard";
import MealFormCard from "./MealFormCard";
<<<<<<< HEAD
import DashboardHeader from "../components/DashboardHeader";
import ExpenseSummary from "../components/ExpenseSummary";
=======
import MessSummaryCard from "./MessSummaryCard";
>>>>>>> main

const Dashboard = () => {
  const [mess, setMess] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);
<<<<<<< HEAD
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);
=======
  const [shouldReloadSummary, setShouldReloadSummary] = useState(false);
  const currentMonth = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
>>>>>>> main

  const navigate = useNavigate();
<<<<<<< HEAD
  const { user, loading } = useAuth();

  const triggerSummaryRefresh = () => {
    setSummaryRefreshKey(prevKey => prevKey + 1);
=======
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
>>>>>>> main
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  const handleNavigateToAdminDashboard = () => {
    if (user.isAdmin) {
      navigate("/admin-dashboard", { state: { user } });
    }
  };

  useEffect(() => {
    if (loading || !user) return;
    const fetchData = async () => {
      try {
        const userRes = await api.get("/api/users/me");
        const { messId } = userRes.data;

<<<<<<< HEAD
        if (messId) {
          const messRes = await api.get(`/api/mess/${messId}`);
          setMess(messRes.data);
        } else {
          setMess(null); // User is not part of a mess
        }
=======
        const userRes = await api.get("/api/users/me", {
          headers,
        });
        setUser(userRes.data);

        const { messId, _id: userId } = userRes.data;

        const messRes = await api.get(`/api/mess/${messId}`, { headers });
        setMess(messRes.data);
>>>>>>> main
      } catch (err) {
        console.error(
          "Error loading dashboard data:",
          err.response?.data || err.message
        );
      }
    };

    fetchData();
  }, [user, loading]);

  if (!user || !mess) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <DashboardHeader
        mess={mess}
        user={user}
        handleLogout={handleLogout}
        handleNavigateToAdminDashboard={handleNavigateToAdminDashboard}
        setShowMealForm={setShowMealForm}
        showMealForm={showMealForm}
      />

<<<<<<< HEAD
      <ExpenseSummary messId={mess._id} userId={user.userId} summaryRefreshKey={summaryRefreshKey} />
=======
        <h2 className="text-xl font-bold mb-2">{mess.name}</h2>
        <p className="text-gray-700">👥 Members: {mess.members?.length || 1}</p>
        <p className="text-gray-700">📅 Month: {currentMonth}</p>
        <p className="text-gray-700">
          👑 Admin: {user.isAdmin ? "You" : "N/A"}
        </p>
>>>>>>> main

      <RecentExpensesCard messId={mess._id} user={user} onUpdate={triggerSummaryRefresh} />

<<<<<<< HEAD
      <FixedExpensesCard messId={mess._id} user={user} onUpdate={triggerSummaryRefresh} />
=======
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
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div> */}

      {/* 🧮 Split Summary */}
      <MessSummaryCard
        messId={mess._id}
        shouldReloadSummary={shouldReloadSummary}
        setShouldReloadSummary={setShouldReloadSummary}
      />

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
>>>>>>> main
    </div>
  );
};

export default Dashboard;
