"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
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
import { useTransactionModal } from "@/components/client/TransactionModalProvider";
import { DeleteConfirmDialog } from "@/components/client/DeleteConfirmDialog";
import { TransactionItem } from "@/components/server/RecentActivity";

interface TransactionRowProps {
  transaction: TransactionItem;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { openModal } = useTransactionModal();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const IconComponent = getIcon(transaction.type, transaction.label);
  const isIncome = transaction.type === "income";

  const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group hover:bg-background/50 px-2 rounded-xl transition-colors">
        {/* Icon & Label */}
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
              {transaction.label}
            </span>
            <span className="text-xs text-text-muted truncate">
              {formattedDate} {transaction.note ? `• ${transaction.note}` : ""}
            </span>
          </div>
        </div>

        {/* Amount & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Action buttons (hover reveal on desktop, always visible on mobile) */}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => openModal(transaction.type, transaction)}
              aria-label="Edit transaction"
              className="p-1.5 text-text-muted hover:text-accent rounded-lg hover:bg-background transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete transaction"
              className="p-1.5 text-text-muted hover:text-expense rounded-lg hover:bg-background transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <span
            className={`text-sm font-bold ${
              isIncome ? "text-income" : "text-expense"
            }`}
          >
            {isIncome ? "+ " : "- "}Rs.{" "}
            {transaction.amount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          transaction={transaction}
          onCancel={() => setShowDeleteConfirm(false)}
          onSuccess={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
