import { useEffect, useState } from "react";

const RecentExpensesCard = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchExpenses = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/expenses/recent/${user.messId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setExpenses(data);
      } else {
        console.error("Failed to load expenses:", data.message);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
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
    const expenseData = {
      ...newExpense,
    };

    try {
      const res = await fetch(`http://localhost:5000/api/expenses/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(expenseData),
      });

      if (res.ok) {
        setNewExpense({
          category: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
        });
        setShowForm(false);
        fetchExpenses();
      } else {
        const errData = await res.json();
        console.error("Add failed:", errData.message);
      }
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Expenses</h3>
        <button
          className="text-blue-600 text-sm hover:underline"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add New"}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            name="category"
            placeholder="Category (e.g. Milk, Snacks)"
            value={newExpense.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
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
    </div>
  );
};

export default RecentExpensesCard;
