"use client";

import React, { useState, useRef, useEffect } from "react";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "@/types";

interface ExpenseStepProps {
  onSuccess: () => void;
  onSkip: () => void;
}

const MAX_AMOUNT = 10_000_000;

export function ExpenseStep({ onSuccess, onSkip }: ExpenseStepProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter an amount greater than 0, or skip this step.");
      inputRef.current?.focus();
      return;
    }

    if (parsedAmount > MAX_AMOUNT) {
      setError("Amount cannot exceed Rs. 10,000,000.");
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const monthStr = dateStr.slice(0, 7);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          category,
          date: dateStr,
          month: monthStr,
          paymentMethod: "Cash",
          note: "Initial expense",
          source: "manual",
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setError(resData.error || "Failed to save expense. Please try again.");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2
          id="onboarding-modal-title"
          className="text-2xl font-bold text-text-primary tracking-tight"
        >
          Add your first expense
        </h2>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">
          Log something you spent today (optional) — e.g. groceries, fuel, or chai.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-expense text-expense text-xs sm:text-sm rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="onboarding-expense-amount"
            className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Amount (Rs.)
          </label>
          <input
            id="onboarding-expense-amount"
            ref={inputRef}
            type="number"
            step="any"
            min="1"
            max={MAX_AMOUNT}
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="onboarding-expense-category"
            className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Category
          </label>
          <select
            id="onboarding-expense-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-3">
        <button
          type="button"
          onClick={onSkip}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text-primary border border-border rounded-xl hover:bg-background transition-colors disabled:opacity-50 cursor-pointer text-center"
        >
          Skip this step
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-center"
        >
          {loading ? "Saving..." : "Add expense"}
        </button>
      </div>
    </form>
  );
}
