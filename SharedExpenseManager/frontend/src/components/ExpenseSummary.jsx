import React, { useEffect, useState } from 'react';
import api from '../api/api';

const ExpenseSummary = ({ messId, userId }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get(`/api/expenses/summary/${messId}/${userId}`);
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching expense summary:", err);
      }
    };

    if (messId && userId) {
      fetchSummary();
    }
  }, [messId, userId]);

  if (!summary) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-100 p-4 rounded-xl text-center">
        <p className="text-sm text-gray-600">Total Expenses</p>
        <p className="text-lg font-bold">৳{summary.totalExpenses.toFixed(2)}</p>
      </div>
      <div className="bg-green-100 p-4 rounded-xl text-center">
        <p className="text-sm text-gray-600">Your Contribution</p>
        <p className="text-lg font-bold">৳{summary.userContribution.toFixed(2)}</p>
      </div>
      <div className="bg-yellow-100 p-4 rounded-xl text-center">
        <p className="text-sm text-gray-600">Your Share</p>
        <p className="text-lg font-bold">৳{summary.userShare.toFixed(2)}</p>
      </div>
      <div className="bg-purple-100 p-4 rounded-xl text-center">
        <p className="text-sm text-gray-600">Balance</p>
        <p className={`text-lg font-bold ${summary.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {summary.balance >= 0 ? `+৳${summary.balance.toFixed(2)}` : `-৳${Math.abs(summary.balance).toFixed(2)}`}
        </p>
      </div>
    </div>
  );
};

export default ExpenseSummary;