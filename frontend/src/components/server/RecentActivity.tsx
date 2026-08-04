import React from "react";
import {
  Wallet,
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { AddFirstExpenseButton } from "@/components/client/AddFirstExpenseButton";

export interface TransactionItem {
  id: string;
  type: "income" | "expense";
  label: string;
  amount: number;
  date: string; // ISO or formatted
  note?: string;
}

interface RecentActivityProps {
  transactions: TransactionItem[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  const getIcon = (type: "income" | "expense", label: string) => {
    if (type === "income") return Wallet;

    switch (label) {
      case "Food":
        return UtensilsCrossed;
      case "Transport":
        return Car;
      case "Rent":
        return Home;
      case "Utilities":
        return Zap;
      case "Education":
        return GraduationCap;
      case "Health":
        return HeartPulse;
      case "Shopping":
        return ShoppingBag;
      case "Family":
        return Users;
      default:
        return MoreHorizontal;
    }
  };

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
          {transactions.map((tx) => {
            const IconComponent = getIcon(tx.type, tx.label);
            const isIncome = tx.type === "income";

            const formattedDate = new Date(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={tx.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    aria-hidden="true"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-income/10 text-income"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {tx.label}
                    </span>
                    <span className="text-xs text-text-muted truncate">
                      {formattedDate} {tx.note ? `• ${tx.note}` : ""}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-sm font-bold shrink-0 ${
                    isIncome ? "text-income" : "text-expense"
                  }`}
                >
                  {isIncome ? "+ " : "- "}Rs.{" "}
                  {tx.amount.toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
