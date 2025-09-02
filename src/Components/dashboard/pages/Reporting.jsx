import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaDollarSign,
  FaShoppingCart,
  FaBoxOpen,
  FaChartLine,
} from "react-icons/fa";

// وارد کردن توابع API
import {
  fetchDashboardStats,
  fetchSalesOverTime,
  fetchProductPerformance,
  fetchCategoryProfitability,
} from "../../../services/api";

// وارد کردن کامپوننت‌ها
import SalesChart from "./charts/SalesChart";
import TopProductsTable from "./charts/TopProductsTable";
import CategoryProfitChart from "./charts/CategoryProfitChart";
import ReportingFilters from "../pages/ReportingFilters"; // <-- وارد کردن رابط کاربری فیلتر جدید
import StatCard from "./charts/StatCard"; // مطمئن شوید این مسیر صحیح است

const Reporting = () => {
  // --- حالت برای نگهداری فیلترهای فعلی ---
  const [filters, setFilters] = useState({});

  // --- به‌روزرسانی هوک‌های useQuery برای استفاده از فیلترها ---
  // کلید کوئری اکنون شامل آبجکت فیلترها است.
  // وقتی فیلترها تغییر می‌کنند، کلید تغییر می‌کند و react-query به طور خودکار داده‌ها را دوباره واکشی می‌کند.

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats", filters],
    queryFn: () => fetchDashboardStats(filters),
  });

  const { data: salesTrend, isLoading: salesTrendLoading } = useQuery({
    queryKey: ["salesOverTime", filters],
    queryFn: () => fetchSalesOverTime(filters),
  });

  const { data: productPerf, isLoading: perfLoading } = useQuery({
    queryKey: ["productPerformance", filters],
    queryFn: () => fetchProductPerformance(filters),
  });

  const { data: categoryProfit, isLoading: catProfitLoading } = useQuery({
    queryKey: ["categoryProfitability", filters],
    queryFn: () => fetchCategoryProfitability(filters),
  });

  const isLoading =
    statsLoading || salesTrendLoading || perfLoading || catProfitLoading;

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">گزارشات تجاری</h1>

      {/* --- افزودن کامپوننت فیلتر در اینجا --- */}
      <ReportingFilters onFilterChange={setFilters} />

      {/* گرید کارت‌های آمار - اکنون بر اساس فیلترها به‌روز می‌شود */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaChartLine />}
          title="درآمد کل"
          value={stats?.total_revenue}
          prefix="$"
          loading={statsLoading}
        />
        <StatCard
          icon={<FaDollarSign />}
          title="سود شرکت"
          value={stats?.total_company_profit}
          prefix="$"
          loading={statsLoading}
        />
        <StatCard
          icon={<FaShoppingCart />}
          title="مجموع فروشات"
          value={stats?.total_sales_count}
          loading={statsLoading}
        />
        <StatCard
          icon={<FaBoxOpen />}
          title="ارزش موجودی (کل زمان)"
          value={stats?.inventory_value}
          prefix="$"
          loading={statsLoading}
        />
      </div>

      {/* بخش چارت‌ها - اکنون بر اساس فیلترها به‌روز می‌شود */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            فروش و سود در طول زمان
          </h2>
          <SalesChart data={salesTrend} isLoading={salesTrendLoading} />
        </div>
        <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            سود بر اساس دسته‌بندی
          </h2>
          <CategoryProfitChart
            data={categoryProfit}
            isLoading={catProfitLoading}
          />
        </div>
      </div>

      {/* بخش عملکرد محصول - اکنون بر اساس فیلترها به‌روز می‌شود */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable
          title="محصولات برتر بر اساس درآمد"
          data={productPerf?.by_revenue}
          valueKey="total_revenue"
          valuePrefix="$"
          isLoading={perfLoading}
        />
        <TopProductsTable
          title="محصولات برتر بر اساس تعداد فروش"
          data={productPerf?.by_quantity}
          valueKey="units_sold"
          isLoading={perfLoading}
        />
      </div>
    </div>
  );
};

export default Reporting;
