import React from "react";

interface DashboardStatsProps {
  spentThisMonth: number;
  remainingThisMonth: number;
  cumulativeBalance: number;
}

export function DashboardStats({
  spentThisMonth,
  remainingThisMonth,
  cumulativeBalance,
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

      {/* 3. Cumulative Balance */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Balance (Cumulative)
        </span>
        <span className="text-3xl font-extrabold text-text-primary tracking-tight">
          {formatCurrency(cumulativeBalance)}
        </span>
      </div>
    </div>
  );
}
