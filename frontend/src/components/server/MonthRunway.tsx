import React from "react";

interface MonthRunwayProps {
  selectedMonth: string;
  currentMonth: string;
  incomeThisMonth: number;
  spentThisMonth: number;
}

export function MonthRunway({
  selectedMonth,
  currentMonth,
  incomeThisMonth,
  spentThisMonth,
}: MonthRunwayProps) {
  // Hide entirely if not selected for the current real month
  if (selectedMonth !== currentMonth) {
    return null;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const currentDayOfMonth = now.getDate();
  const daysLeft = Math.max(0, daysInCurrentMonth - currentDayOfMonth);

  const remaining = incomeThisMonth - spentThisMonth;
  const formattedRemaining = Math.abs(remaining).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  // Calculate percentage of month passed
  const monthProgressPct = Math.min(
    100,
    Math.max(0, Math.round((currentDayOfMonth / daysInCurrentMonth) * 100))
  );

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-text-primary">
          {daysLeft} {daysLeft === 1 ? "day left" : "days left"} this month
        </span>
        <span className="text-text-muted">
          {remaining < 0 ? `- Rs. ${formattedRemaining}` : `Rs. ${formattedRemaining}`} remaining
        </span>
      </div>

      <div className="w-full bg-background border border-border h-3 rounded-full overflow-hidden">
        <div
          style={{ width: `${monthProgressPct}%` }}
          className="bg-signature h-full rounded-full transition-all duration-500"
        />
      </div>
    </div>
  );
}
