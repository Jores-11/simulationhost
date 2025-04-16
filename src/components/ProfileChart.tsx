"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { toast } from "react-toastify";

interface ProfileData {
  month: string;
  revenue: number;
  users: number;
}

interface ProfileChartProps {
  data: ProfileData[];
  dataKey: "revenue" | "users";
  title: string;
  stroke: string;
  fill: string;
  unit: string;
}

export default function ProfileChart({ data, dataKey, title, stroke, fill, unit }: ProfileChartProps) {
  const exportToCSV = () => {
    const csvContent = [
      ["Month", title],
      ...data.map((item) => [item.month, item[dataKey]]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}_Data.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${title} data exported as CSV!`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
        <button
          onClick={exportToCSV}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <Download size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
          <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
          <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600">
                    <p className="text-sm font-semibold">{label}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm">
                        {entry.name}: {entry.value} {unit}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2}
            activeDot={{ r: 8, fill: stroke, stroke: "#fff", strokeWidth: 2 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}