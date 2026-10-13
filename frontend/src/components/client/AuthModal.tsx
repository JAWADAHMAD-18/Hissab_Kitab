"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "@/components/client/AuthModalProvider";
import { LoginForm } from "@/components/client/LoginForm";
import { SignupForm } from "@/components/client/SignupForm";

export function AuthModal() {
  const { isOpen, mode, openModal, closeModal } = useAuthModal();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store trigger element that had focus before modal opened
      triggerRef.current = document.activeElement as HTMLElement;

      // Lock body scroll
      document.body.style.overflow = "hidden";

      // Focus first input inside modal
      const timer = setTimeout(() => {
        const firstInput = cardRef.current?.querySelector<HTMLInputElement>("input");
        if (firstInput) {
          firstInput.focus();
        } else if (cardRef.current) {
          cardRef.current.focus();
        }
      }, 50);

      // Handle Esc key
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

        // Restore focus to trigger element
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
            aria-labelledby="auth-modal-title"
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

            {/* Form Content */}
            {mode === "login" ? (
              <LoginForm
                onToggleMode={() => openModal("signup")}
                onSuccess={closeModal}
                onNavigate={closeModal}
              />
            ) : (
              <SignupForm
                onToggleMode={() => openModal("login")}
                onSuccess={closeModal}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
