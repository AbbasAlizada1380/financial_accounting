import React, { useState } from "react";
import DatePicker from "react-datepicker";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

const FilterButton = ({ label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-white text-gray-700 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

const ReportingFilters = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activePreset, setActivePreset] = useState("all_time");

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setActivePreset(null); // غیرفعال کردن پیش‌تنظیم‌ها هنگام انتخاب محدوده سفارشی

    // فیلتر را فقط در صورت انتخاب هر دو تاریخ اعمال کنید
    if (start && end) {
      onFilterChange({
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      });
    }
  };

  const applyPreset = (preset) => {
    setActivePreset(preset);
    let start, end;
    const today = new Date();

    switch (preset) {
      case "today":
        start = today;
        end = today;
        break;
      case "this_week":
        start = startOfWeek(today);
        end = endOfWeek(today);
        break;
      case "this_month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "this_year":
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      case "all_time":
      default:
        onFilterChange({}); // آبجکت خالی فیلترهای تاریخ را پاک می‌کند
        setStartDate(null);
        setEndDate(null);
        return;
    }

    setStartDate(start);
    setEndDate(end);
    onFilterChange({
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    });
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center justify-between gap-4"
      dir="rtl"
    >
      {/* دکمه‌های از پیش تعیین شده */}
      <div className="flex items-center gap-2">
        <FilterButton
          label="کل زمان"
          onClick={() => applyPreset("all_time")}
          isActive={activePreset === "all_time"}
        />
        <FilterButton
          label="امروز"
          onClick={() => applyPreset("today")}
          isActive={activePreset === "today"}
        />
        <FilterButton
          label="این هفته"
          onClick={() => applyPreset("this_week")}
          isActive={activePreset === "this_week"}
        />
        <FilterButton
          label="این ماه"
          onClick={() => applyPreset("this_month")}
          isActive={activePreset === "this_month"}
        />
        <FilterButton
          label="امسال"
          onClick={() => applyPreset("this_year")}
          isActive={activePreset === "this_year"}
        />
      </div>

      {/* انتخابگر محدوده تاریخ */}
      <div>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          isClearable
          placeholderText="یک محدوده تاریخ سفارشی انتخاب کنید"
          className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default ReportingFilters;
