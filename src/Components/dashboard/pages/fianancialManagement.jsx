import React, { useState } from "react";
import IncomeManagement from "./IncomeManagement";
import ExpenseManagement from "./ExpenseManagement";

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState("income");

return (
  <div className="p-5 relative h-full overflow-hidden bg-white rounded-lg shadow-sm">
    {/* Fixed Tabs Navbar */}
    <div className="sticky top-0 z-20 bg-545F66 flex justify-center gap-3 py-3 border-b border-gray-200 backdrop-blur-sm">
      <button
        onClick={() => setActiveTab("income")}
        className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 ease-in-out
        ${
          activeTab === "income"
            ? "bg-blue-600 text-white shadow-md scale-105"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
        }`}
      >
        عواید
      </button>
      <button
        onClick={() => setActiveTab("expense")}
        className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 ease-in-out
        ${
          activeTab === "expense"
            ? "bg-blue-600 text-white shadow-md scale-105"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
        }`}
      >
        مصارف
      </button>
    </div>

    {/* Scrollable Content */}
    <div className="overflow-y-auto h-[calc(100vh-130px)] pb-6 px-2 custom-scrollbar">
      {activeTab === "income" ? <IncomeManagement /> : <ExpenseManagement />}
    </div>
  </div>
);

};

export default FinancialManagement;
