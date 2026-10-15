"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { signOut } from "next-auth/react";
import { clearAllCaches } from "@/lib/clearAllCaches";

export function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to delete account. Please try again.");
        setDeleting(false);
        return;
      }
      await clearAllCaches();
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("An unexpected error occurred.");
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-surface border border-expense/30 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-expense shrink-0" />
          <h2 className="text-lg font-bold text-text-primary tracking-tight">Danger Zone</h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          This permanently deletes your account and all your transactions. This can&apos;t be undone.
        </p>
        <button
          type="button"
          onClick={() => { setConfirmText(""); setError(null); setShowModal(true); }}
          className="px-5 py-2.5 bg-expense hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer w-fit"
        >
          Delete My Account
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <DeleteConfirmModal
            confirmText={confirmText}
            setConfirmText={setConfirmText}
            canDelete={canDelete}
            deleting={deleting}
            error={error}
            onCancel={() => setShowModal(false)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface DeleteConfirmModalProps {
  confirmText: string;
  setConfirmText: (v: string) => void;
  canDelete: boolean;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({
  confirmText,
  setConfirmText,
  canDelete,
  deleting,
  error,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handleKey);
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-surface border border-border rounded-2xl shadow-xl max-w-md w-full p-6 relative z-50 flex flex-col gap-5"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-expense/10 text-expense flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 id="delete-account-title" className="text-lg font-bold text-text-primary">
            Delete your account?
          </h3>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          This will permanently delete your account and <strong className="text-text-primary">all your transactions</strong>. This action is irreversible.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">
            Type <strong className="text-text-primary font-mono">DELETE</strong> to confirm
          </label>
          <input
            ref={inputRef}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-expense font-mono"
          />
        </div>

        {error && (
          <p className="text-xs text-expense font-semibold">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text-primary border border-border rounded-xl hover:bg-background transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete || deleting}
            className="px-5 py-2.5 bg-expense hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
