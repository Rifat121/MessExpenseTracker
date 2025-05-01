import { useEffect, useState } from "react";
import api from "../api/api";

const FixedExpensesCard = ({ messId, user }) => {
  const [expenses, setExpenses] = useState({
    electricity_bill: "",
    gas_bill: "",
    internet_bill: "",
    rent: "",
    maid: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpenses, setEditedExpenses] = useState({});
  const [error, setError] = useState("");
  const [updateExpense, setUpdateExpense] = useState("");

  const fetchExpenses = async () => {
    setError("");
    try {
      const res = await api.get(`/api/fixed-expenses/${messId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = res.data;
      setExpenses({
        electricity_bill: data.electricity_bill || "",
        gas_bill: data.gas_bill || "",
        internet_bill: data.internet_bill || "",
        rent: data.rent || "",
        maid: data.maid || "",
      });
      setEditedExpenses({
        electricity_bill: data.electricity_bill || "",
        gas_bill: data.gas_bill || "",
        internet_bill: data.internet_bill || "",
        rent: data.rent || "",
        maid: data.maid || "",
      });
    } catch (err) {
      console.error("Error fetching expenses:", err);
      const errorMessage = !err.response
        ? "Network error. Please try again later."
        : err.response?.data.message ||
          "Error fetching expenses. Please try again.";

      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [messId]);

  const handleChange = (e) => {
    setEditedExpenses({ ...editedExpenses, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setUpdateExpense("");
    try {
      const res = await api.put(
        `/api/fixed-expenses/${messId}`,
        editedExpenses, // body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsEditing(false);
      setExpenses(editedExpenses);
    } catch (err) {
      console.error("Error updating expenses:", err);
      const errorMessage = !err.response
        ? "Network error. Please try again later."
        : err.response?.data.message ||
          "Error updating expenses. Please try again.";

      setUpdateExpense(errorMessage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Fixed Expenses</h3>
        {user?.isAdmin && (
          <button
            onClick={() => {
              setError("");
              setIsEditing(!isEditing);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}

        {Object.entries(expenses).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="capitalize">{key.replace(/_/g, " ")} </span>
            {isEditing ? (
              <input
                type="number"
                name={key}
                value={editedExpenses[key] || ""}
                onChange={handleChange}
                className="w-28 border p-1 rounded text-right"
              />
            ) : (
              <span>৳{value || 0}</span>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div>
          {updateExpense && (
            <div className="text-red-500 mt-2">{updateExpense}</div>
          )}
          <button
            onClick={handleSave}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default FixedExpensesCard;
