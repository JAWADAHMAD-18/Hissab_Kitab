"use client";

import { useTransactionModal } from "@/components/client/TransactionModalProvider";
import { Button } from "@/components/client/Button";
import { VoiceLogButton } from "@/components/client/VoiceLogButton";

export function QuickAddButtons() {
  const { openModal } = useTransactionModal();

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Button
        variant="secondary"
        onClick={() => openModal("income")}
        className="!no-underline border border-border bg-surface hover:bg-background text-text-primary px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl shadow-xs"
      >
        + Add Income
      </Button>

      <Button
        variant="primary"
        onClick={() => openModal("expense")}
        className="px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl"
      >
        + Add Expense
      </Button>

      <VoiceLogButton />
    </div>
  );
}
