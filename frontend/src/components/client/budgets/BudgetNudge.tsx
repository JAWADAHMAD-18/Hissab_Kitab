"use client";

import React, { useState, useEffect } from "react";
import { Target } from "lucide-react";
import { BudgetsButton } from "./BudgetsButton";

const DISMISSAL_KEY = "hk:budget-nudge-dismissed-at";
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

interface BudgetNudgeProps {
  eligible: boolean;
  month: string;
  budgets: Record<string, number>;
}

export function BudgetNudge({ eligible, month, budgets }: BudgetNudgeProps) {
  // Start dismissed on server and initial client render to prevent hydration mismatch
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let isDismissed = false;
    try {
      const stored = localStorage.getItem(DISMISSAL_KEY);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (!isNaN(timestamp) && Date.now() - timestamp < FOURTEEN_DAYS_MS) {
          isDismissed = true;
        }
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }

    const timer = setTimeout(() => {
      setDismissed(isDismissed);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISSAL_KEY, String(Date.now()));
    } catch {
      // Ignore localStorage write failures
    }
    setDismissed(true);
  };

  if (!eligible || dismissed) {
    return null;
  }

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">
            Stay on top of your spending
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Set a monthly limit per category and we&apos;ll warn you at 80%.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto shrink-0">
        <BudgetsButton
          month={month}
          budgets={budgets}
          hasBudgets={false}
          variant="primary"
          label="Set budgets →"
        />
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs font-medium text-text-muted hover:text-text-primary px-2 py-1.5 transition-colors cursor-pointer"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
