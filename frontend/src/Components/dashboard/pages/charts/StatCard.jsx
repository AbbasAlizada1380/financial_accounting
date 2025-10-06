import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // مطمئن شوید که CSS اسکلت وارد شده است

const StatCard = ({ icon, title, value, prefix = "", loading }) => {
  /**
   * یک کامپوننت کارت قابل استفاده مجدد برای نمایش یک آمار کلیدی.
   *
   * @param {React.ReactNode} icon - آیکونی که روی کارت نمایش داده می‌شود.
   * @param {string} title - عنوان یا برچسب برای آمار (مثلاً "درآمد کل").
   * @param {number|string} value - مقدار عددی آمار.
   * @param {string} [prefix=''] - یک پیشوند برای مقدار (مثلاً "$").
   * @param {boolean} loading - اگر true باشد، به جای مقدار، یک لودر اسکلتی نمایش می‌دهد.
   */

  // این تابع کمکی عدد را برای نمایش فرمت‌بندی می‌کند.
  // این از نمایش اعشار برای اعداد صحیح جلوگیری می‌کند (مثلاً "150" را به جای "150.00" نشان می‌دهد).
  const formatValue = (num) => {
    const number = Number(num || 0);
    // از toLocaleString برای جداکننده‌های کاما و مدیریت هوشمند اعشار استفاده کنید.
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: number % 1 === 0 ? 0 : 2,
    });
  };

  return (
    <div
      className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4"
      dir="rtl"
    >
      {/* دربرگیرنده آیکون */}
      <div className="p-3 bg-gray-100 text-blue-500 text-2xl rounded-full">
        {icon}
      </div>

      {/* محتوای متنی */}
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>

        {/* رندر شرطی: اگر در حال بارگذاری است اسکلت را نشان بده، در غیر این صورت مقدار را نشان بده. */}
        {loading ? (
          <Skeleton width={100} height={28} className="mt-1" />
        ) : (
          <h2 className="text-2xl font-bold text-gray-800 mt-1">
            {prefix}
            {formatValue(value)}
          </h2>
        )}
      </div>
    </div>
  );
};

export default StatCard;
