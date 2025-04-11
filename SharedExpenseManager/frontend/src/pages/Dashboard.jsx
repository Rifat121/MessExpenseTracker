import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchExpenses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(res.data);
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      }
    };

    fetchExpenses();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Dashboard</h2>
        <button
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mb-4"
          onClick={handleLogout}
        >
          Logout
        </button>
        <h3 className="text-lg font-semibold mb-2">Expenses</h3>
        {expenses.length > 0 ? (
          <ul className="list-none p-0">
            {console.log(expenses)}
            {expenses.map((expense) => (
              <li key={expense._id} className="bg-gray-200 p-2 my-2 rounded">
                {expense.payer.name} - {expense.category} - ${expense.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No expenses found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
