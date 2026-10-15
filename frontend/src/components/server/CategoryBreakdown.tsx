import React from "react";
import { ChartRenderer } from "@/components/client/ChartRenderer";
import { BudgetsButton } from "@/components/client/budgets/BudgetsButton";
import { BudgetStatus } from "@/lib/budgets";

interface CategorySum {
  category: string;
  amount: number;
}

interface CategoryBreakdownProps {
  categorySums: CategorySum[];
  totalSpent: number;
  budgets?: Record<string, number>;
  statuses?: BudgetStatus[];
  month?: string;
}

function formatRs(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function CategoryBreakdown({
  categorySums,
  totalSpent,
  budgets = {},
  statuses = [],
  month = "",
}: CategoryBreakdownProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-4">
      {/* Header with Title, Set Budgets button, and category count */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-text-primary tracking-tight">
          Category Breakdown
        </h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <BudgetsButton month={month} budgets={budgets} />
          <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
            {categorySums.length} {categorySums.length === 1 ? "category" : "categories"}
          </span>
        </div>
      </div>

      {/* Budget Progress Rows (categories with a budget, plus Overall if Total budget exists) */}
      {statuses.length > 0 && (
        <div className="flex flex-col gap-3.5 pt-1 pb-1 border-b border-border/60">
          {statuses.map((item) => {
            const isTotal = item.category === "Total";
            const label = isTotal ? "Overall" : item.category;
            const isOver = item.level === "over";
            const isWarn = item.level === "warn";

            const barColor = isOver
              ? "bg-expense"
              : isWarn
              ? "bg-signature"
              : "bg-accent";

            const textColor = isOver
              ? "text-expense"
              : isWarn
              ? "text-signature"
              : "text-text-muted";

            const fillWidth = isOver ? 100 : Math.min(item.percent, 100);

            const statLabel = isOver
              ? `Over by ${formatRs(item.spent - item.budget)}`
              : `${item.percent}%`;

            return (
              <div key={item.category} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium">
                  <span className="text-text-primary font-semibold truncate">
                    {label}
                  </span>
                  <span className="text-text-muted shrink-0 text-right text-xs">
                    {formatRs(item.spent)} of {formatRs(item.budget)} ·{" "}
                    <strong className={textColor}>{statLabel}</strong>
                  </span>
                </div>

                <div className="h-2 w-full bg-border/60 rounded-full overflow-hidden">
                  <div
                    role="progressbar"
                    aria-valuenow={fillWidth}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label} budget progress: ${item.percent}%`}
                    style={{ width: `${fillWidth}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart is preserved as is */}
      <ChartRenderer data={categorySums} totalSpent={totalSpent} />
    </div>
  );
}
