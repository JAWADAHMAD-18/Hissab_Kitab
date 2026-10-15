"use client";

import React, { useState, useEffect, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { BUDGET_TOTAL, EXPENSE_CATEGORIES } from "@/types";

interface BudgetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  month: string;
  budgets: Record<string, number>;
}

const ALL_BUDGET_ROWS = [
  { key: BUDGET_TOTAL, label: "Overall (optional)" },
  ...EXPENSE_CATEGORIES.map((cat) => ({ key: cat, label: cat })),
];

const MAX_AMOUNT = 10_000_000;

function BudgetEditorModalContent({
  onClose,
  onSuccess,
  month,
  budgets,
}: Omit<BudgetEditorModalProps, "isOpen">) {
  const router = useRouter();
  const [scope, setScope] = useState<"from" | "only">("from");
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const row of ALL_BUDGET_ROWS) {
      const val = budgets[row.key];
      initial[row.key] = val !== undefined && val > 0 ? String(val) : "";
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Body scroll lock and focus restoration
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, []);

  // Escape key and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!saving) {
          onClose();
        }
        return;
      }

      if (e.key === "Tab" && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  const monthName = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleInputChange = (category: string, value: string) => {
    // Only allow positive integers or empty string
    const sanitized = value.replace(/[^0-9]/g, "");
    setInputs((prev) => ({ ...prev, [category]: sanitized }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    // Compute changed rows only
    const items: Array<{ category: string; amount: number }> = [];

    for (const row of ALL_BUDGET_ROWS) {
      const orig = budgets[row.key] ?? 0;
      const str = (inputs[row.key] ?? "").trim();
      const val = str === "" ? 0 : Number(str);

      if (isNaN(val) || val < 0 || val > MAX_AMOUNT) {
        setError(`Amount for ${row.label} must be between 0 and 10,000,000`);
        return;
      }

      if (val !== orig) {
        items.push({
          category: row.key,
          amount: val,
        });
      }
    }

    // If nothing changed, just close
    if (items.length === 0) {
      onClose();
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/budgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          scope,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update budgets. Please try again.");
        setSaving(false);
        return;
      }

      onClose();
      startTransition(() => {
        router.refresh();
      });
      onSuccess();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => {
          if (!saving) onClose();
        }}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
      />

      {/* Modal Card */}
      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-editor-title"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-surface border border-border rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 relative z-50 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <h2
            id="budget-editor-title"
            className="text-lg sm:text-xl font-bold text-text-primary tracking-tight"
          >
            Monthly budgets
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
            className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-expense text-expense text-xs sm:text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Rows List */}
          <div className="flex flex-col gap-2.5">
            {ALL_BUDGET_ROWS.map((row, idx) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-3 py-1"
              >
                <label
                  htmlFor={`budget-input-${row.key}`}
                  className="text-xs sm:text-sm font-medium text-text-primary truncate flex-1"
                >
                  {row.label}
                </label>
                <div className="relative w-36 sm:w-40 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-semibold">
                    Rs.
                  </span>
                  <input
                    id={`budget-input-${row.key}`}
                    ref={idx === 0 ? firstInputRef : undefined}
                    type="text"
                    inputMode="numeric"
                    placeholder="No limit"
                    value={inputs[row.key] ?? ""}
                    onChange={(e) => handleInputChange(row.key, e.target.value)}
                    disabled={saving}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-text-primary text-xs sm:text-sm focus:outline-none focus:border-accent disabled:opacity-50 text-right"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scope Radio Section */}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Apply to:
            </span>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-text-primary">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="budgetScope"
                  value="from"
                  checked={scope === "from"}
                  onChange={() => setScope("from")}
                  disabled={saving}
                  className="accent-accent w-4 h-4"
                />
                <span>This month and onward</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="budgetScope"
                  value="only"
                  checked={scope === "only"}
                  onChange={() => setScope("only")}
                  disabled={saving}
                  className="accent-accent w-4 h-4"
                />
                <span>Only {monthName}</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-text-primary border border-border rounded-xl hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function BudgetEditorModal({
  isOpen,
  onClose,
  onSuccess,
  month,
  budgets,
}: BudgetEditorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <BudgetEditorModalContent
          key={month}
          onClose={onClose}
          onSuccess={onSuccess}
          month={month}
          budgets={budgets}
        />
      )}
    </AnimatePresence>
  );
}
