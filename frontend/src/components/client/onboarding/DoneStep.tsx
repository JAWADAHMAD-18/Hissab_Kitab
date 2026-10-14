"use client";

import React from "react";
import { CheckCircle2, Mic, MessageSquare } from "lucide-react";

interface DoneStepProps {
  onComplete: () => void;
  loading?: boolean;
}

export function DoneStep({ onComplete, loading = false }: DoneStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-1">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2
          id="onboarding-modal-title"
          className="text-2xl font-bold text-text-primary tracking-tight"
        >
          You&apos;re all set!
        </h2>
        <p className="text-sm text-text-muted leading-relaxed max-w-sm">
          Your dashboard is ready. Here are a couple of quick tips to keep your finances updated with zero friction:
        </p>
      </div>

      <div className="flex flex-col gap-3 bg-background/60 border border-border/80 rounded-xl p-4 text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10 text-accent mt-0.5 shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-text-primary text-xs uppercase tracking-wider">
              Voice Logging
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Tap the mic icon anytime and speak in Urdu or English, e.g. <span className="text-text-primary font-medium italic">&quot;aj shawarma 500 ka&quot;</span>.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2 border-t border-border/50">
          <div className="p-2 rounded-lg bg-border/40 text-text-muted mt-0.5 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-text-primary text-xs uppercase tracking-wider">
              WhatsApp Integration
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              WhatsApp logging — coming soon.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={onComplete}
          disabled={loading}
          autoFocus
          className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-center"
        >
          {loading ? "Finishing..." : "Go to dashboard"}
        </button>
      </div>
    </div>
  );
}
