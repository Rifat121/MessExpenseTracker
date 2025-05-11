import React, { useState, useEffect } from "react";
import api from "../api/api";

const MessSummaryCard = ({
  messId,
  shouldReloadSummary,
  setShouldReloadSummary,
}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentMonth = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}-${month < 10 ? "0" + month : month}`;
  };
  const month = getCurrentMonth();

  useEffect(() => {
    setLoading(true);
    setError(null); // Reset error before making a new request
    const fetchSummary = () => {
      api
        .get(`/api/mess/summary/${messId}?month=${month}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => response.data)
        .then((responseData) => {
          setData(responseData);
          setLoading(false);
        })
        .catch((error) => {
          setError("There was an error fetching the data.");
          setLoading(false);
          console.error("Error fetching data: ", error);
        });
    };
    if (shouldReloadSummary) {
      fetchSummary();
      setShouldReloadSummary(false);
    }
  }, [messId, month, shouldReloadSummary]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100">
      {/* Total Summary Card */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-2xl font-semibold mb-5 text-black-700">
          📋 Mess Summary (
          {new Date(`${data.month}-01`).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
          )
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
          {[
            ["🍛 Total Meals", data.totalMeals],
            ["💰 Meal Rate", `৳${data.mealRate}`],
            ["📈 Meal Expense", `৳${data.mealExpense}`],
            ["🏠 Fixed Expense", `৳${data.fixedExpense}`],
            ["⚡ Utility Expense", `৳${data.utilityExpense}`],
          ].map(([label, value], index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
            >
              <span>{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Members Breakdown Table */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Members Due Details:</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Total Meals</th>
              <th className="px-4 py-2 border">Meal Cost</th>
              <th className="px-4 py-2 border">Fixed Expenses</th>
              <th className="px-4 py-2 border">Member Expense</th>
              <th className="px-4 py-2 border">Total Due</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((member, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2  text-center">{member.name}</td>
                <td className="px-4 py-2  text-center">{member.totalMeals}</td>
                <td className="px-4 py-2  text-center">৳{member.mealCost}</td>
                <td className="px-4 py-2  text-center">৳{member.fixedShare}</td>
                <td className="px-4 py-2  text-center">
                  ৳{member.userExpense}
                </td>
                <td className="px-4 py-2  text-center">৳{member.totalDue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessSummaryCard;
