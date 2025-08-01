import React from 'react';

const ExpenseSummary = () => {
  return (
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
  );
};

export default ExpenseSummary;