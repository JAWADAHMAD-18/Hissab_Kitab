"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { WeekGroup } from "@/lib/groupTransactionsByWeek";
import { TransactionRow } from "@/components/client/TransactionRow";
import { useTransactionModal } from "@/components/client/TransactionModalProvider";
import { TransactionItem } from "@/components/server/RecentActivity";

interface TransactionsListClientProps {
  weeks: WeekGroup[];
}

export function TransactionsListClient({ weeks }: TransactionsListClientProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { openModal } = useTransactionModal();

  const hasAny = weeks.length > 0;

  // Flatten all transactions across all weeks
  const allTransactions = useMemo<TransactionItem[]>(() => {
    return weeks.flatMap((w) => w.all);
  }, [weeks]);

  // Filtered to selected date
  const filteredTransactions = useMemo<TransactionItem[]>(() => {
    if (!selectedDate) return [];
    return allTransactions.filter((tx) => {
      const d = new Date(tx.date).toISOString().slice(0, 10);
      return d === selectedDate;
    });
  }, [allTransactions, selectedDate]);

  const formattedSelectedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Date filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="date"
            value={selectedDate || ""}
            onChange={(e) => setSelectedDate(e.target.value || null)}
            className="px-3 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent shadow-xs cursor-pointer"
          />
        </div>
        {selectedDate && (
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary px-3 py-2 rounded-xl border border-border bg-surface hover:bg-background transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Empty month state */}
      {!hasAny && (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
          <p className="text-sm font-medium text-text-muted">
            No transactions yet this month
          </p>
          <button
            type="button"
            onClick={() => openModal("expense")}
            className="px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Add your first one
          </button>
        </div>
      )}

      {/* Date-filtered view */}
      {hasAny && selectedDate && (
        <>
          {filteredTransactions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm font-medium text-text-muted">
                No transactions on {formattedSelectedDate}
              </p>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary px-3 py-2 rounded-xl border border-border bg-surface hover:bg-background transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear filter
              </button>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col divide-y divide-border/60">
              {filteredTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Week-grouped view */}
      {hasAny && !selectedDate && (
        <div className="flex flex-col gap-8">
          {weeks.map((week) => (
            <div key={week.weekLabel} className="flex flex-col gap-3">
              {/* Week header */}
              <div className="flex items-center justify-between sticky top-[72px] z-20 bg-background/90 backdrop-blur-sm py-2 border-b border-border/60">
                <span className="text-sm font-bold text-text-primary">
                  {week.weekLabel}
                </span>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  {week.totalIn > 0 && (
                    <span className="text-income">
                      ↑ Rs. {week.totalIn.toLocaleString("en-IN")}
                    </span>
                  )}
                  {week.totalOut > 0 && (
                    <span className="text-expense">
                      ↓ Rs. {week.totalOut.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Week transactions */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col divide-y divide-border/60">
                {week.all.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
