import { Types } from "mongoose";

// Enums / Const Arrays as specified in docs/PLAN.md
export const INCOME_SOURCES = ["Salary", "Freelance", "Allowance", "Other"] as const;
export type IncomeSource = (typeof INCOME_SOURCES)[number];

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Education",
  "Health",
  "Shopping",
  "Family",
  "Other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHODS = ["Cash", "Card", "Bank"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const EXPENSE_SOURCES = ["manual", "voice", "whatsapp"] as const;
export type ExpenseSource = (typeof EXPENSE_SOURCES)[number];

// User Interface
export interface IUser {
  _id?: Types.ObjectId | string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  whatsappNumber?: string;
  whatsappVerified?: boolean;
  whatsappVerificationCode?: string;
  whatsappVerificationExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Income Interface
export interface IIncome {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  amount: number;
  source: IncomeSource;
  date: Date;
  month: string; // YYYY-MM format
  recurring?: boolean;
  note?: string;
  waMessageId?: string;
  waIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Expense Interface
export interface IExpense {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  month: string; // YYYY-MM format
  paymentMethod?: PaymentMethod;
  note?: string;
  source: ExpenseSource;
  waMessageId?: string;
  waIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
