"use client";

import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { BudgetEditorModal } from "./BudgetEditorModal";
import { Toast } from "@/components/client/Toast";

interface BudgetsButtonProps {
  month: string;
  budgets: Record<string, number>;
  hasBudgets?: boolean;
  variant?: "outline" | "primary";
  label?: string;
}

export function BudgetsButton({
  month,
  budgets,
  hasBudgets = false,
  variant = "outline",
  label,
}: BudgetsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const buttonLabel = label || (hasBudgets ? "Edit budgets" : "Set budgets");

  const buttonClasses =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] text-xs sm:text-sm font-semibold text-white bg-accent hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      : "inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-sm font-semibold text-accent border border-accent/40 rounded-xl hover:bg-accent/5 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClasses}
      >
        <SlidersHorizontal className="w-4 h-4 shrink-0" />
        <span>{buttonLabel}</span>
      </button>

      <BudgetEditorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => setShowToast(true)}
        month={month}
        budgets={budgets}
      />

      {showToast && (
        <Toast
          message="Budgets updated successfully"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
