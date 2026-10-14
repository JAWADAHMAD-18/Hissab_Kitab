"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeStep } from "./WelcomeStep";
import { IncomeStep } from "./IncomeStep";
import { ExpenseStep } from "./ExpenseStep";
import { DoneStep } from "./DoneStep";

interface OnboardingWizardProps {
  firstName: string;
}

export function OnboardingWizard({ firstName }: OnboardingWizardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const hasAddedEntriesRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Manage body scroll lock and restore focus
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, []);

  // Trap focus inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);

    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
      });
    } catch {
      // Continue even if network error so user isn't permanently trapped
    } finally {
      setIsOpen(false);
      if (hasAddedEntriesRef.current) {
        router.refresh();
      }
    }
  };

  const handleIncomeSuccess = () => {
    hasAddedEntriesRef.current = true;
    setStep(3);
  };

  const handleExpenseSuccess = () => {
    hasAddedEntriesRef.current = true;
    setStep(4);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - Non-dismissible per requirements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
          />

          {/* Modal Card */}
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface border border-border rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 relative z-50 outline-none"
          >
            {/* Progress Dots */}
            <div
              className="flex items-center justify-center gap-2 mb-6"
              aria-label={`Step ${step} of 4`}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-6 bg-accent"
                      : i < step
                      ? "w-2 bg-accent/60"
                      : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Step Contents */}
            {step === 1 && (
              <WelcomeStep
                firstName={firstName}
                onNext={() => setStep(2)}
                onSkip={handleFinish}
              />
            )}

            {step === 2 && (
              <IncomeStep
                onSuccess={handleIncomeSuccess}
                onSkip={handleFinish}
              />
            )}

            {step === 3 && (
              <ExpenseStep
                onSuccess={handleExpenseSuccess}
                onSkip={() => setStep(4)}
              />
            )}

            {step === 4 && (
              <DoneStep
                onComplete={handleFinish}
                loading={isFinishing}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
