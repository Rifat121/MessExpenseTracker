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

  const fetchExpenses = async () => {
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
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [messId]);

  const handleChange = (e) => {
    setEditedExpenses({ ...editedExpenses, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await api.put(`/api/fixed-expenses/${messId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editedExpenses),
      });

      if (res.ok) {
        setIsEditing(false);
        setExpenses(editedExpenses);
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Fixed Expenses</h3>
        {user?.isAdmin && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(expenses).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="capitalize">
              {key.replace("_", " ").replace("_", " ")}
            </span>
            {isEditing ? (
              <input
                type="number"
                name={key}
                value={editedExpenses[key]}
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
        <button
          onClick={handleSave}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default FixedExpensesCard;
