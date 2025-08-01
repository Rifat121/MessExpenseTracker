import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import FixedExpensesCard from "./FixedExpensesCard";
import RecentExpensesCard from "./RecentExpensesCard";
import MealFormCard from "./MealFormCard";
import DashboardHeader from "../components/DashboardHeader";
import ExpenseSummary from "../components/ExpenseSummary";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [mess, setMess] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);

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

        const { messId } = userRes.data;

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
      <DashboardHeader
        mess={mess}
        user={user}
        handleLogout={handleLogout}
        handleNavigateToAdminDashboard={handleNavigateToAdminDashboard}
        setShowMealForm={setShowMealForm}
        showMealForm={showMealForm}
        token={token}
      />

      <ExpenseSummary />

      <RecentExpensesCard messId={mess._id} user={user} />

      <FixedExpensesCard messId={mess._id} user={user} />
    </div>
  );
};

export default Dashboard;

export default Dashboard;
