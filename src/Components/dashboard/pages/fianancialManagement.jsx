import React, { useState } from "react";
import IncomeManagement from "./IncomeManagement";
import ExpenseManagement from "./ExpenseManagement";

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState("income");

  return (
    <div className="p-5">
      {/* Navbar Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("income")}
          className={`px-4 py-2 rounded-lg shadow ${
            activeTab === "income"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          عواید
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`px-4 py-2 rounded-lg shadow ${
            activeTab === "expense"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          مصارف
        </button>
      </div>

      {/* Show Component */}
      {activeTab === "income" ? <IncomeManagement /> : <ExpenseManagement />}
    </div>
  );
};

export default FinancialManagement;
