"use client";

import React from "react";
import { Wallet } from "lucide-react";

interface WelcomeStepProps {
  firstName: string;
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ firstName, onNext, onSkip }: WelcomeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-1">
          <Wallet className="w-7 h-7" />
        </div>
        <h2
          id="onboarding-modal-title"
          className="text-2xl font-bold text-text-primary tracking-tight"
        >
          Welcome to Hisab Kitab, {firstName}
        </h2>
        <p className="text-sm text-text-muted leading-relaxed max-w-sm">
          Track your monthly income and daily spending, and always know what&apos;s
          left this month.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-2">
        <button
          type="button"
          onClick={onSkip}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text-primary border border-border rounded-xl hover:bg-background transition-colors cursor-pointer text-center"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={onNext}
          autoFocus
          className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer text-center"
        >
          Let&apos;s start
        </button>
      </div>
    </div>
  );
}
