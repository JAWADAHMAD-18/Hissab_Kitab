import React from "react";

export default function TransactionsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 lg:py-12 flex flex-col gap-8 animate-pulse">
      {/* Header + Month Switcher row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="w-40 h-7 bg-surface border border-border rounded-lg" />
          <div className="w-24 h-4 bg-surface border border-border rounded-md" />
        </div>
        <div className="w-44 h-10 bg-surface border border-border rounded-xl" />
      </div>

      {/* Date filter input */}
      <div className="w-48 h-10 bg-surface border border-border rounded-xl" />

      {/* Week 1 */}
      <div className="flex flex-col gap-3">
        {/* Week header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="w-36 h-4 bg-surface border border-border rounded-md" />
          <div className="flex gap-3">
            <div className="w-20 h-4 bg-surface border border-border rounded-md" />
            <div className="w-20 h-4 bg-surface border border-border rounded-md" />
          </div>
        </div>
        {/* Transaction rows */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-background border border-border shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-28 h-3.5 bg-background border border-border rounded-md" />
                  <div className="w-20 h-3 bg-background border border-border rounded-md" />
                </div>
              </div>
              <div className="w-20 h-4 bg-background border border-border rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Week 2 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="w-36 h-4 bg-surface border border-border rounded-md" />
          <div className="w-20 h-4 bg-surface border border-border rounded-md" />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-background border border-border shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-32 h-3.5 bg-background border border-border rounded-md" />
                  <div className="w-16 h-3 bg-background border border-border rounded-md" />
                </div>
              </div>
              <div className="w-16 h-4 bg-background border border-border rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
