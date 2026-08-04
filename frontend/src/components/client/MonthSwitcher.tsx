"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSwitcherProps {
  selectedMonth: string; // YYYY-MM
  currentMonth: string; // YYYY-MM
}

export function MonthSwitcher({
  selectedMonth,
  currentMonth,
}: MonthSwitcherProps) {
  const router = useRouter();

  const [yearStr, monthStr] = selectedMonth.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;

  const dateObj = new Date(year, monthIdx, 1);
  const formattedLabel = dateObj.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isCurrentOrFuture = selectedMonth >= currentMonth;

  const handlePrev = () => {
    let prevYear = year;
    let prevMonth = monthIdx; // 0-indexed (0=Jan)
    if (prevMonth === 0) {
      prevMonth = 11;
      prevYear -= 1;
    } else {
      prevMonth -= 1;
    }
    const formattedMonth = String(prevMonth + 1).padStart(2, "0");
    const target = `${prevYear}-${formattedMonth}`;
    router.push(`/dashboard?month=${target}`);
  };

  const handleNext = () => {
    if (isCurrentOrFuture) return;
    let nextYear = year;
    let nextMonth = monthIdx;
    if (nextMonth === 11) {
      nextMonth = 0;
      nextYear += 1;
    } else {
      nextMonth += 1;
    }
    const formattedMonth = String(nextMonth + 1).padStart(2, "0");
    const target = `${nextYear}-${formattedMonth}`;
    router.push(`/dashboard?month=${target}`);
  };

  return (
    <div className="inline-flex items-center gap-3 bg-surface border border-border rounded-xl px-3 py-2 shadow-xs">
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous Month"
        className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-background transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm font-semibold text-text-primary min-w-[120px] text-center select-none">
        {formattedLabel}
      </span>

      <button
        type="button"
        onClick={handleNext}
        disabled={isCurrentOrFuture}
        aria-label="Next Month"
        className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
