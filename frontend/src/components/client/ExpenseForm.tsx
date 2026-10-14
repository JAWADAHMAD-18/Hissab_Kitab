"use client";

import { useState, startTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  ExpenseCategory,
  PaymentMethod,
} from "@/types";
import { TransactionData } from "@/components/client/TransactionModalProvider";

interface ExpenseFormInputs {
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod?: PaymentMethod;
  note?: string;
}

interface ExpenseFormProps {
  defaultValues?: TransactionData | null;
  onSuccess: () => void;
}

export function ExpenseForm({ defaultValues, onSuccess }: ExpenseFormProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const docId = defaultValues?._id || defaultValues?.id;
  const isEditing = Boolean(docId);

  const todayStr = new Date().toISOString().slice(0, 10);

  const initialDateStr = defaultValues?.date
    ? new Date(defaultValues.date).toISOString().slice(0, 10)
    : todayStr;

  const initialCategory = (defaultValues?.category || defaultValues?.label || "Food") as ExpenseCategory;

  const initialPaymentMethod = (defaultValues?.paymentMethod as PaymentMethod) || "Bank";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormInputs>({
    defaultValues: {
      amount: defaultValues?.amount || undefined,
      category: EXPENSE_CATEGORIES.includes(initialCategory)
        ? initialCategory
        : "Food",
      date: initialDateStr,
      paymentMethod: PAYMENT_METHODS.includes(initialPaymentMethod)
        ? initialPaymentMethod
        : "Bank",
      note: defaultValues?.note || "",
    },
  });

  const onSubmit = async (data: ExpenseFormInputs) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const parsedAmount = Number(data.amount);
      const computedMonth = data.date.slice(0, 7);

      const url = isEditing ? `/api/expenses/${docId}` : "/api/expenses";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          category: data.category,
          date: data.date,
          month: computedMonth,
          paymentMethod: data.paymentMethod || undefined,
          note: data.note || "",
          source: defaultValues?.source || "manual",
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setErrorMsg(
          resData.error || `Failed to ${isEditing ? "update" : "add"} expense. Please try again.`
        );
        setLoading(false);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
      onSuccess();
    } catch (err: unknown) {
      console.error("Expense submit error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-expense text-expense text-sm rounded-md text-center">
          {errorMsg}
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Amount (Rs.) <span className="text-expense">*</span>
        </label>
        <input
          type="number"
          step="any"
          placeholder="0.00"
          {...register("amount", {
            required: "Amount is required",
            min: { value: 0.01, message: "Amount must be greater than 0" },
          })}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
        />
        {errors.amount && (
          <span className="text-xs text-expense mt-1 block">
            {errors.amount.message}
          </span>
        )}
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Category <span className="text-expense">*</span>
        </label>
        <select
          {...register("category", { required: "Category is required" })}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <span className="text-xs text-expense mt-1 block">
            {errors.category.message}
          </span>
        )}
      </div>

      {/* Date Input */}
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Date <span className="text-expense">*</span>
        </label>
        <input
          type="date"
          {...register("date", { required: "Date is required" })}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
        />
        {errors.date && (
          <span className="text-xs text-expense mt-1 block">
            {errors.date.message}
          </span>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Payment Method (Optional)
        </label>
        <select
          {...register("paymentMethod")}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
        >
          {PAYMENT_METHODS.map((pm) => (
            <option key={pm} value={pm}>
              {pm}
            </option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Note (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="Lunch at cafe, taxi fare..."
          {...register("note")}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer mt-2"
      >
        {loading ? (isEditing ? "Updating..." : "Adding Expense...") : isEditing ? "Update" : "Add Expense"}
      </button>
    </form>
  );
}
