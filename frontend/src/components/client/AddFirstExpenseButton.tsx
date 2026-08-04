"use client";

import { useTransactionModal } from "@/components/client/TransactionModalProvider";
import { Button } from "@/components/client/Button";

export function AddFirstExpenseButton() {
  const { openModal } = useTransactionModal();

  return (
    <Button
      variant="primary"
      onClick={() => openModal("expense")}
      className="px-5 py-2.5 text-sm font-semibold rounded-xl"
    >
      Add your first one
    </Button>
  );
}
