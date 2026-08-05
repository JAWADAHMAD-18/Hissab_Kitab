import React from "react";
import { AddFirstExpenseButton } from "@/components/client/AddFirstExpenseButton";
import { TransactionRow } from "@/components/client/TransactionRow";

export interface TransactionItem {
  id: string;
  _id?: string;
  type: "income" | "expense";
  label: string;
  amount: number;
  date: string; // ISO string
  source?: string;
  category?: string;
  recurring?: boolean;
  paymentMethod?: string;
  note?: string;
}

interface RecentActivityProps {
  transactions: TransactionItem[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary tracking-tight">
          Recent Activity
        </h3>
        {transactions.length > 0 && (
          <span className="text-xs font-medium text-text-muted">
            {transactions.length} recent
          </span>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
          <p className="text-sm font-medium text-text-muted">
            No transactions yet this month
          </p>
          <AddFirstExpenseButton />
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/60">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
