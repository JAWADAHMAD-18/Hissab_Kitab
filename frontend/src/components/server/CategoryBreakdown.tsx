import React from "react";
import { ChartRenderer } from "@/components/client/ChartRenderer";

interface CategorySum {
  category: string;
  amount: number;
}

interface CategoryBreakdownProps {
  categorySums: CategorySum[];
  totalSpent: number;
}

export function CategoryBreakdown({
  categorySums,
  totalSpent,
}: CategoryBreakdownProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary tracking-tight">
          Category Breakdown
        </h3>
        <span className="text-xs font-semibold text-text-muted">
          {categorySums.length} {categorySums.length === 1 ? "category" : "categories"}
        </span>
      </div>

      <ChartRenderer data={categorySums} totalSpent={totalSpent} />
    </div>
  );
}
