import { useEffect, useState } from "react";
import api from "../api/api";

const RecentExpensesCard = ({ user, onUpdate }) => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchExpenses = async () => {
    setLoading(true); // Start loading

    try {
      const res = await api.get(`/api/expenses/recent/${user.messId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setExpenses(res.data);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching expenses:", err);

      const errorMessage = !err.response
        ? "Network error. Please try again later."
        : err.response?.data.message ||
          "Error fetching expenses. Please try again.";

      setError(errorMessage); // Set error message
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    if (user?.messId) {
      fetchExpenses();
    }
  }, [user?.messId]);

  const handleChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    if (!newExpense.amount || !newExpense.category) {
      setError("Both Amount and Category are required.");
      return;
    }
    if (!newExpense.amount || newExpense.amount <= 0) {
      setError("Amount must be a valid positive number.");
      return;
    }
    try {
      const res = await api.post("/api/expenses/add", newExpense);

      // Success case
      setNewExpense({
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      fetchExpenses();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error adding expense:", err);

      const errorMessage = !err.response
        ? "Network error. Please try again later."
        : err.response?.data.message ||
          "Error adding recent expenses. Please try again.";

      setError(errorMessage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      {loading && <p>Loading...</p>} {/* Display loading message */}
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Expenses</h3>
        <button
          className="text-blue-600 text-sm hover:underline"
          onClick={() => {
            setError();
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "Add New"}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 space-y-2">
          <select
            name="category"
            value={newExpense.category}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-white"
          >
            <option value="">Select Category</option>
            <option value="Groceries">Groceries</option>
            <option value="Utilities">Utilities</option>
          </select>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Expense
          </button>
        </div>
      )}
      {!loading && !error && expenses.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Date</th>
              <th>Category</th>
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
                <td>{exp.category}</td>
                <td>৳{exp.amount}</td>
                <td>{exp.payer?.name || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecentExpensesCard;
