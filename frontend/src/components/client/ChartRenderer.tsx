"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CategorySum {
  category: string;
  amount: number;
}

interface ChartRendererProps {
  data: CategorySum[];
  totalSpent: number;
}

export function ChartRenderer({ data, totalSpent }: ChartRendererProps) {
  if (!data || data.length === 0 || totalSpent === 0) {
    return (
      <div className="py-12 text-center text-text-muted text-sm font-medium">
        No expenses recorded yet for this month.
      </div>
    );
  }

  // Color shades matching clean expense red/gray theme
  const shades = [
    "#DC2626",
    "#EF4444",
    "#F87171",
    "#FCA5A5",
    "#9CA3AF",
    "#6B7280",
    "#4B5563",
    "#374151",
    "#1F2937",
  ];

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
            formatter={(value: any) => [
              `Rs. ${Number(value || 0).toLocaleString("en-IN")}`,
              "Amount",
            ]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#111827",
            }}
          />
          <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={shades[index % shades.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
