"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type TransactionType = "income" | "expense";

interface TransactionModalContextType {
  isOpen: boolean;
  type: TransactionType;
  openModal: (type: TransactionType) => void;
  closeModal: () => void;
}

const TransactionModalContext = createContext<
  TransactionModalContextType | undefined
>(undefined);

export function TransactionModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");

  const openModal = useCallback((newType: TransactionType) => {
    setType(newType);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <TransactionModalContext.Provider
      value={{ isOpen, type, openModal, closeModal }}
    >
      {children}
    </TransactionModalContext.Provider>
  );
}

export function useTransactionModal() {
  const context = useContext(TransactionModalContext);
  if (!context) {
    throw new Error(
      "useTransactionModal must be used within a TransactionModalProvider"
    );
  }
  return context;
}
