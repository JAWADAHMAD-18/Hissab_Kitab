"use client";

import React, { useState } from "react";
import { BudgetEditorModal } from "./BudgetEditorModal";
import { Toast } from "@/components/client/Toast";

interface BudgetsButtonProps {
  month: string;
  budgets: Record<string, number>;
}

export function BudgetsButton({ month, budgets }: BudgetsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Set budgets
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
