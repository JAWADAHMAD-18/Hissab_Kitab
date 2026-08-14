import React from "react";

interface DashboardStatsProps {
  spentThisMonth: number;
  remainingThisMonth: number;
  incomeThisMonth: number;
  carriedForward: number;
}

export function DashboardStats({
  spentThisMonth,
  remainingThisMonth,
  incomeThisMonth,
  carriedForward,
}: DashboardStatsProps) {
  const formatCurrency = (val: number) => {
    const formatted = Math.abs(val).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
    return val < 0 ? `- Rs. ${formatted}` : `Rs. ${formatted}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Spent This Month */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Spent This Month
        </span>
        <span className="text-3xl font-extrabold text-expense tracking-tight">
          {formatCurrency(spentThisMonth)}
        </span>
      </div>

      {/* 2. Remaining This Month */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Remaining This Month
        </span>
        <span
          className={`text-3xl font-extrabold tracking-tight ${
            remainingThisMonth >= 0 ? "text-income" : "text-expense"
          }`}
        >
          {formatCurrency(remainingThisMonth)}
        </span>
      </div>

      {/* 3. Income This Month */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Income This Month
        </span>
        <span className="text-3xl font-extrabold text-income tracking-tight">
          {formatCurrency(incomeThisMonth)}
        </span>
        {carriedForward > 0 && (
          <div
            className="text-xs text-text-muted flex items-center gap-1 mt-1 cursor-help"
            title="Your net savings carried forward from all previous months"
          >
            <span className="text-income font-semibold">+</span>
            <span>Rs. {carriedForward.toLocaleString("en-IN", { maximumFractionDigits: 0 })} from last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
