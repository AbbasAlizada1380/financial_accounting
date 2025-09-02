import React from "react";
import Skeleton from "react-loading-skeleton";

// یک آبجکت برای ترجمه کلیدهای پویای هدر
const headerTranslations = {
  total_revenue: "درآمد کل",
  units_sold: "واحدهای فروخته شده",
};

const TopProductsTable = ({
  title,
  data,
  valueKey,
  valuePrefix = "",
  isLoading,
}) => {
  const translatedHeader =
    headerTranslations[valueKey] || valueKey.replace("_", " ");

  return (
    <div className="bg-white p-5 rounded-lg shadow" dir="rtl">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-600">
          <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-3 text-right">نام محصول</th>
              <th className="p-3 text-right">SKU</th>
              <th className="p-3 text-left">{translatedHeader}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  <td colSpan="3">
                    <Skeleton height={40} />
                  </td>
                </tr>
              ))}
            {!isLoading &&
              data?.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{product.tool}</td>
                  <td className="p-3">{product.sku}</td>
                  <td className="p-3 font-semibold text-left">
                    {valuePrefix}
                    {Number(product[valueKey]).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProductsTable;
