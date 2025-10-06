import React, { useState } from "react";
import IncomeManagement from "./IncomeManagement";
import ExpenseManagement from "./ExpenseManagement";

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState("income");

return (
  <div className="p-5 relative h-full overflow-hidden border-white">
    {/* Fixed Tabs Navbar */}
    <div className="sticky rounded-t-lg top-0 bg-white z-10 flex justify-center gap-4 pt-3  shadow-sm">
      <button
        onClick={() => setActiveTab("income")}
        className={`px-4 py-2 rounded-t-lg shadow-t transition-all ${
          activeTab === "income"
            &&"bg-gray-200 text-gray-700"
        }`}
      >
        عواید
      </button>
      <button
        onClick={() => setActiveTab("expense")}
        className={`px-4 py-2 rounded-t-lg shadow-t transition-all ${
          activeTab === "expense"
            && "bg-gray-200 text-gray-700"
        }`}
      >
        مصارف
      </button>
    </div>

    {/* Scrollable Content */}
    <div className="overflow-y-auto h-[calc(100vh-100px)] pb-4">
      {activeTab === "income" ? <IncomeManagement /> : <ExpenseManagement />}
    </div>
  </div>
);

};

export default FinancialManagement;
