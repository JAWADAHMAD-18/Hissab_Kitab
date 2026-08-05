"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/client/Button";
import { TransactionItem } from "@/components/server/RecentActivity";

interface DeleteConfirmDialogProps {
  transaction: TransactionItem;
  onCancel: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  transaction,
  onCancel,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  const handleDelete = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const endpoint =
        transaction.type === "income"
          ? `/api/income/${transaction.id}`
          : `/api/expenses/${transaction.id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setErrorMsg(
          resData.error || "Failed to delete transaction. Please try again."
        );
        setLoading(false);
        return;
      }

      router.refresh();
      onSuccess();
    } catch (err: unknown) {
      console.error("Delete transaction error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
        />

        {/* Modal Card */}
        <motion.div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-surface border border-border rounded-2xl shadow-xl max-w-md w-full p-6 relative z-50 outline-none flex flex-col gap-4"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-expense/10 text-expense flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3
              id="delete-dialog-title"
              className="text-lg font-bold text-text-primary tracking-tight"
            >
              Delete this transaction?
            </h3>
          </div>

          <p className="text-sm text-text-muted leading-relaxed">
            This will permanently delete the{" "}
            <strong className="text-text-primary font-semibold">
              {transaction.label}
            </strong>{" "}
            entry for{" "}
            <strong className="text-text-primary font-semibold">
              Rs. {transaction.amount.toLocaleString("en-IN")}
            </strong>
            . This can&apos;t be undone.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-expense text-expense text-xs rounded-md text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-2.5 bg-expense hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
