import React from "react";
import { BudgetStatus } from "@/lib/budgets";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface BudgetAlertProps {
  statuses: BudgetStatus[];
}

export function BudgetAlert({ statuses }: BudgetAlertProps) {
  const alertStatuses = statuses.filter(
    (s) => s.level === "warn" || s.level === "over"
  );

  if (alertStatuses.length === 0) {
    return null;
  }

  const hasOver = alertStatuses.some((s) => s.level === "over");

  let message: string;

  if (hasOver) {
    const overList = alertStatuses
      .filter((s) => s.level === "over")
      .map((s) => (s.category === "Total" ? "Monthly" : s.category));

    if (overList.length === 1) {
      message = `${overList[0] === "Monthly" ? "Monthly budget" : overList[0]} is over budget`;
    } else if (overList.length === 2) {
      message = `You're over your ${overList[0]} and ${overList[1]} budgets`;
    } else {
      message = `You're over budget in ${overList[0]}, ${overList[1]}, and others`;
    }
  } else {
    const warnList = alertStatuses.filter((s) => s.level === "warn");

    if (warnList.length === 1) {
      const name =
        warnList[0].category === "Total" ? "Monthly budget" : warnList[0].category;
      message = `${name} is at ${warnList[0].percent}% of its budget`;
    } else if (warnList.length === 2) {
      const c1 = warnList[0].category === "Total" ? "Monthly" : warnList[0].category;
      const c2 = warnList[1].category === "Total" ? "Monthly" : warnList[1].category;
      message = `${c1} and ${c2} are near their budget limits`;
    } else {
      message = `${warnList.length} categories are near their budget limits`;
    }
  }

  return (
    <div
      role="alert"
      className={`rounded-2xl px-4 py-3 border flex items-center gap-2.5 text-xs sm:text-sm font-semibold overflow-hidden shadow-xs ${
        hasOver
          ? "bg-expense/10 border-expense/25 text-expense"
          : "bg-signature/10 border-signature/25 text-signature"
      }`}
    >
      {hasOver ? (
        <AlertCircle className="w-4 h-4 shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 shrink-0" />
      )}
      <span className="truncate flex-1">{message}</span>
    </div>
  );
}
