"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTransactionModal } from "@/components/client/TransactionModalProvider";
import { IncomeForm } from "@/components/client/IncomeForm";
import { ExpenseForm } from "@/components/client/ExpenseForm";

export function TransactionModal() {
  const { isOpen, type, closeModal } = useTransactionModal();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      const timer = setTimeout(() => {
        const firstInput = cardRef.current?.querySelector<HTMLInputElement>("input");
        if (firstInput) {
          firstInput.focus();
        } else if (cardRef.current) {
          cardRef.current.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeModal();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";

        if (triggerRef.current) {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen, closeModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
          />

          {/* Modal Card */}
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface border border-border rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 relative z-50 outline-none"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Title */}
            <div className="mb-6">
              <h2
                id="transaction-modal-title"
                className="text-2xl font-bold text-text-primary tracking-tight"
              >
                {type === "income" ? "Add Income" : "Add Expense"}
              </h2>
              <p className="text-sm text-text-muted mt-1">
                {type === "income"
                  ? "Record a salary, allowance, or freelance payout"
                  : "Record a daily expense item"}
              </p>
            </div>

            {/* Form Component */}
            {type === "income" ? (
              <IncomeForm onSuccess={closeModal} />
            ) : (
              <ExpenseForm onSuccess={closeModal} />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
