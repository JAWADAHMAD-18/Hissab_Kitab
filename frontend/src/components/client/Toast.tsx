"use client";

import React, { useEffect } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose?: () => void;
  durationMs?: number;
}

export function Toast({
  message,
  type = "success",
  onClose,
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!onClose || durationMs <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const isSuccess = type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-sm max-w-sm w-[90%] sm:w-full bg-surface text-text-primary ${
        isSuccess ? "border-income" : "border-expense"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-income shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-expense shrink-0" />
      )}
      <span className="flex-1 font-medium text-xs sm:text-sm">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-text-muted hover:text-text-primary p-0.5 rounded cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
