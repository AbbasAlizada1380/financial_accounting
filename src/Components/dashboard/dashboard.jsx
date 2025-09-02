// src/apps/dashboard/Dashboard.jsx

import React from "react";
import {
  FaTshirt,
  FaSyncAlt,
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
} from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// === USE THE NEW, CORRECT API FUNCTIONS ===
import {
  fetchDashboardStats,
  fetchSalesOverTime,
  fetchProductPerformance,
  fetchProducts,
} from "../../services/api"; // Make sure path is correct

// === USE THE NEW, WORKING CHART COMPONENTS ===
import SalesChart from "./pages/charts/SalesChart";
import TopProductsTable from "./pages/charts/TopProductsTable";

const Dashboard = () => {
  const queryClient = useQueryClient();

  // --- FETCH ALL NECESSARY DATA FOR THE DASHBOARD IN PARALLEL ---

  // 1. Fetch main stats (Revenue, Profit, Order Count)
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  // 2. Fetch sales over time for the main chart
  const { data: salesTrend, isLoading: salesTrendLoading } = useQuery({
    queryKey: ["salesOverTime"],
    queryFn: fetchSalesOverTime,
  });

  // 3. Fetch product performance for the top-selling tables
  const { data: productPerf, isLoading: perfLoading } = useQuery({
    queryKey: ["productPerformance"],
    queryFn: fetchProductPerformance,
  });

  // 4. Fetch product count (optional, but good for a stat card)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["productsCount"],
    queryFn: () => fetchProducts({ page_size: 1 }), // Uses corrected fetchProducts
  });

  const isLoading =
    statsLoading || productsLoading || salesTrendLoading || perfLoading;

  const handleRefresh = () => {
    // Invalidate all queries to refetch fresh data
    queryClient.invalidateQueries();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100 transition-colors"
        >
          <FaSyncAlt className={`${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* --- STAT CARDS NOW DISPLAY LIVE DATA FROM THE NEW API --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaChartLine />}
          title="Total Revenue"
          value={dashboardStats?.total_revenue}
          prefix="$"
          loading={isLoading}
        />
        <StatCard
          icon={<FaDollarSign />}
          title="Company Profit"
          value={dashboardStats?.total_company_profit}
          prefix="$"
          loading={isLoading}
        />
        <StatCard
          icon={<FaShoppingCart />}
          title="Total Sales"
          value={dashboardStats?.total_sales_count}
          loading={isLoading}
        />
        <StatCard
          icon={<FaTshirt />}
          title="Total Products"
          value={dashboardStats?.total_products}
          loading={isLoading}
        />
      </div>

      {/* --- REPLACED OLD CHARTS WITH NEW, DATA-DRIVEN COMPONENTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Sales Chart */}
        <div className="lg:col-span-3 bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Sales & Profit Over Time
          </h2>
          <SalesChart data={salesTrend} isLoading={salesTrendLoading} />
        </div>

        {/* Top Products by Revenue */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow">
          <TopProductsTable
            title="Top Products by Revenue"
            data={productPerf?.by_revenue}
            valueKey="total_revenue"
            valuePrefix="$"
            isLoading={perfLoading}
          />
        </div>
      </div>
    </div>
  );
};

// Generic StatCard sub-component for reuse
const StatCard = ({ icon, title, value, prefix = "", loading }) => (
  <div className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4">
    <div className="p-3 bg-gray-100 text-blue-500 text-2xl rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      {loading ? (
        <Skeleton width={100} height={28} className="mt-1" />
      ) : (
        <h2 className="text-2xl font-bold text-gray-800 mt-1">
          {prefix}
          {Number(value || 0).toLocaleString(undefined, {
            maximumFractionDigits: value % 1 === 0 ? 0 : 2,
          })}
        </h2>
      )}
    </div>
  </div>
);

export default Dashboard;
