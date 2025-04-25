import { useEffect, useState } from "react";

const FixedExpensesCard = ({ messId }) => {
  const [expenses, setExpenses] = useState({ bill: "", rent: "", maid: "" });
  const [showForm, setShowForm] = useState(false);

  // Fetch existing fixed expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/fixed-expenses/${messId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setExpenses({
          bill: data.bill || "",
          rent: data.rent || "",
          maid: data.maid || "",
        });
      } else {
        console.error("Fetch failed:", data.message);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [messId]);

  const handleChange = (e) => {
    setExpenses({ ...expenses, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/fixed-expenses/${messId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(expenses),
        }
      );

      if (res.ok) {
        setShowForm(false);
        fetchExpenses();
      } else {
        const errData = await res.json();
        console.error("Update failed:", errData.message);
      }
    } catch (err) {
      console.error("Error updating expenses:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Fixed Expenses</h3>

      <ul className="space-y-2 mb-4">
        <li className="flex justify-between text-sm">
          <span>Bill</span>
          <span>৳{expenses.bill}</span>
        </li>
        <li className="flex justify-between text-sm">
          <span>Rent</span>
          <span>৳{expenses.rent}</span>
        </li>
        <li className="flex justify-between text-sm">
          <span>Maid</span>
          <span>৳{expenses.maid}</span>
        </li>
      </ul>

      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm text-blue-600 underline"
      >
        {showForm ? "Cancel" : "Edit Fixed Expenses"}
      </button>

      {showForm && (
        <div className="mt-4 space-y-2">
          <input
            type="number"
            name="bill"
            placeholder="Bill"
            value={expenses.bill}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            name="rent"
            placeholder="Rent"
            value={expenses.rent}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            name="maid"
            placeholder="Maid"
            value={expenses.maid}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default FixedExpensesCard;
