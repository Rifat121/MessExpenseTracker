import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [mess, setMess] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [splitSummary, setSplitSummary] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const userRes = await axios.get("http://localhost:5000/api/users/me", {
          headers,
        });
        setUser(userRes.data);

        const { messId, _id: userId } = userRes.data;

        const messRes = await axios.get(
          `http://localhost:5000/api/mess/${messId}`,
          { headers }
        );
        setMess(messRes.data);

        const expRes = await axios.get(
          `http://localhost:5000/api/expenses/recent/${messId}`,
          { headers }
        );
        setExpenses(expRes.data);

        const fixedRes = await axios.get(
          `http://localhost:5000/api/expenses/fixed/${messId}`,
          { headers }
        );
        setFixedExpenses(fixedRes.data);

        const splitRes = await axios.get(
          `http://localhost:5000/api/expenses/split-summary/${messId}/${userId}`,
          { headers }
        );
        setSplitSummary(splitRes.data);
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

  const isAdmin = user.isAdmin;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* 🏠 Mess Info */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-2">{mess.name}</h2>
        <p className="text-gray-700">👥 Members: {mess.members?.length || 1}</p>
        <p className="text-gray-700">📅 Period: April 2025</p>
        <p className="text-gray-700">
          👑 Admin:{" "}
          {mess.adminName === user.name ? "You" : mess.adminName || "N/A"}
        </p>
      </div>

      {/* 💸 Expense Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-lg font-bold">₹8,000</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Your Contribution</p>
          <p className="text-lg font-bold">₹2,500</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Your Share</p>
          <p className="text-lg font-bold">₹2,000</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Balance</p>
          <p className="text-lg font-bold text-green-700">+₹500</p>
        </div>
      </div>

      {/* 📝 Recent Expenses */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Expenses</h3>
          <button className="text-blue-600 text-sm hover:underline">
            View All
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Paid By</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id} className="border-b">
                <td className="py-2">
                  {new Date(exp.date).toLocaleDateString()}
                </td>
                <td>{exp.description}</td>
                <td>₹{exp.amount}</td>
                <td>{exp.paidBy?.name || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔒 Fixed Expenses (Admin Only) */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Fixed Expenses</h3>
          <ul className="space-y-2">
            {fixedExpenses.map((item) => (
              <li key={item.name} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>₹{item.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🧮 Split Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">You Owe / Receive</h3>
        <ul className="text-sm space-y-2">
          {splitSummary.map((item, idx) => (
            <li key={idx} className="flex justify-between">
              <span>
                {item.type === "receive"
                  ? `You will receive ₹${item.amount} from ${item.from}`
                  : `You owe ₹${item.amount} to ${item.to}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
