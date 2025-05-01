import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import FixedExpensesCard from "./FixedExpensesCard";
import RecentExpensesCard from "./RecentExpensesCard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [mess, setMess] = useState(null);
  // const [splitSummary, setSplitSummary] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // or whatever your login route is
  };
  const handleNavigateToAdminDashboard = () => {
    if (user.isAdmin) {
      console.log(user);
      navigate("/admin-dashboard", { state: { user } }); // Navigate to Admin Dashboard route
    }
  };

  useEffect(() => {
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

        // const splitRes = await api.get(
        //   `/api/expenses/split-summary/${messId}/${userId}`,
        //   { headers }
        // );
        // setSplitSummary(splitRes.data);
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
      <RecentExpensesCard messId={mess._id} user={user} />

      <FixedExpensesCard messId={mess._id} user={user} />

      {/* 🧮 Split Summary */}
      {/* <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">You Owe / Receive</h3>
        <ul className="text-sm space-y-2">
          {splitSummary.map((item, idx) => (
            <li key={idx} className="flex justify-between">
              <span>
                {item.type === "receive"
                  ? `You will receive ৳${item.amount} from ${item.from}`
                  : `You owe ৳${item.amount} to ${item.to}`}
              </span>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default Dashboard;
