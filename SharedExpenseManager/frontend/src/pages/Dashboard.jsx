import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthService from "../services/AuthService";
import api from "../api/api";
import FixedExpensesCard from "./FixedExpensesCard";
import RecentExpensesCard from "./RecentExpensesCard";
import MealFormCard from "./MealFormCard";
import DashboardHeader from "../components/DashboardHeader";
import ExpenseSummary from "../components/ExpenseSummary";

const Dashboard = () => {
  const [mess, setMess] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const triggerSummaryRefresh = () => {
    setSummaryRefreshKey(prevKey => prevKey + 1);
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

        if (messId) {
          const messRes = await api.get(`/api/mess/${messId}`);
          setMess(messRes.data);
        } else {
          setMess(null); // User is not part of a mess
        }
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

      <ExpenseSummary messId={mess._id} userId={user.userId} summaryRefreshKey={summaryRefreshKey} />

      <RecentExpensesCard messId={mess._id} user={user} onUpdate={triggerSummaryRefresh} />

      <FixedExpensesCard messId={mess._id} user={user} onUpdate={triggerSummaryRefresh} />
    </div>
  );
};

export default Dashboard;
