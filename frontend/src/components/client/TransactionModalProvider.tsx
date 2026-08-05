"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type TransactionType = "income" | "expense";
type ModalMode = "add" | "edit";

export interface TransactionData {
  id?: string;
  _id?: string;
  type?: TransactionType;
  amount: number;
  source?: string;
  category?: string;
  date: string | Date;
  recurring?: boolean;
  paymentMethod?: string;
  note?: string;
  [key: string]: any;
}

interface TransactionModalContextType {
  isOpen: boolean;
  type: TransactionType;
  mode: ModalMode;
  transaction: TransactionData | null;
  openModal: (type: TransactionType, transaction?: TransactionData | null) => void;
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
  const [mode, setMode] = useState<ModalMode>("add");
  const [transaction, setTransaction] = useState<TransactionData | null>(null);

  const openModal = useCallback((newType: TransactionType, newTransaction?: TransactionData | null) => {
    setType(newType);
    if (newTransaction) {
      setMode("edit");
      setTransaction(newTransaction);
    } else {
      setMode("add");
      setTransaction(null);
    }
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTransaction(null);
    setMode("add");
  }, []);

  return (
    <TransactionModalContext.Provider
      value={{ isOpen, type, mode, transaction, openModal, closeModal }}
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
