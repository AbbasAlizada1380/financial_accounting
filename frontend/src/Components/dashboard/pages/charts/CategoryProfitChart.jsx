import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF1943",
];

// با افزودن `= []` اطمینان حاصل می‌کنیم که `data` هرگز تعریف‌نشده (undefined) نباشد و از کرش جلوگیری می‌کند.
const CategoryProfitChart = ({ data = [], isLoading }) => {
  // --- اصلاح ۱: افزودن اسکلت بارگذاری ---
  // اگر کوئری هنوز در حال بارگذاری است، یک جای‌نما نشان داده و متوقف شود.
  if (isLoading) {
    return <Skeleton height={300} />;
  }

  // --- اصلاح ۲: مدیریت حالت داده خالی ---
  // اگر بارگذاری تمام شده اما داده‌ای وجود ندارد، یک پیام نشان داده شود.
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        هیچ داده‌ای برای سودآوری موجود نیست.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="total_profit"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} %${(percent * 100).toFixed(0)}`
          }
        >
          {/* این خط اکنون امن است زیرا موارد تعریف‌نشده/خالی را در بالا مدیریت کرده‌ایم */}
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryProfitChart;
