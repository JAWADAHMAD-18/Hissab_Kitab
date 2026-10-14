"use client";

import React, { useState, useRef, useEffect } from "react";
import { INCOME_SOURCES, IncomeSource } from "@/types";

interface IncomeStepProps {
  onSuccess: () => void;
  onSkip: () => void;
}

const MAX_AMOUNT = 10_000_000;

export function IncomeStep({ onSuccess, onSkip }: IncomeStepProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<IncomeSource>("Salary");
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
      setError("Please enter an amount greater than 0.");
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

      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          source,
          date: dateStr,
          month: monthStr,
          recurring: false,
          note: "Initial income",
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setError(resData.error || "Failed to save income. Please try again.");
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
          What&apos;s your income this month?
        </h2>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">
          This is what your &quot;Remaining&quot; balance is calculated from.
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
            htmlFor="onboarding-income-amount"
            className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Amount (Rs.) <span className="text-expense">*</span>
          </label>
          <input
            id="onboarding-income-amount"
            ref={inputRef}
            type="number"
            step="any"
            min="1"
            max={MAX_AMOUNT}
            placeholder="e.g. 75000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            required
            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="onboarding-income-source"
            className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Source <span className="text-expense">*</span>
          </label>
          <select
            id="onboarding-income-source"
            value={source}
            onChange={(e) => setSource(e.target.value as IncomeSource)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer"
          >
            {INCOME_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
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
          Skip for now
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-center"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </form>
  );
}
