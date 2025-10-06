import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Skeleton from "react-loading-skeleton";

const SalesChart = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton height={300} />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="month" />
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#10b981"
          label={{
            value: "درآمد ($)",
            angle: -90,
            position: "insideLeft",
            offset: -15,
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#3b82f6"
          label={{
            value: "سود ($)",
            angle: 90,
            position: "insideRight",
            offset: 15,
          }}
        />
        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="total_revenue"
          fill="#10b981"
          name="درآمد"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="right"
          dataKey="total_profit"
          fill="#3b82f6"
          name="سود"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
