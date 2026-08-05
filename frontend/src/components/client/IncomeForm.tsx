"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { INCOME_SOURCES, IncomeSource } from "@/types";
import { TransactionData } from "@/components/client/TransactionModalProvider";

interface IncomeFormInputs {
  amount: number;
  source: IncomeSource;
  date: string;
  recurring?: boolean;
  note?: string;
}

interface IncomeFormProps {
  defaultValues?: TransactionData | null;
  onSuccess: () => void;
}

export function IncomeForm({ defaultValues, onSuccess }: IncomeFormProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const docId = defaultValues?._id || defaultValues?.id;
  const isEditing = Boolean(docId);

  const todayStr = new Date().toISOString().slice(0, 10);

  const initialDateStr = defaultValues?.date
    ? new Date(defaultValues.date).toISOString().slice(0, 10)
    : todayStr;

  const initialSource = (defaultValues?.source || defaultValues?.label || "Salary") as IncomeSource;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeFormInputs>({
    defaultValues: {
      amount: defaultValues?.amount || undefined,
      source: INCOME_SOURCES.includes(initialSource) ? initialSource : "Salary",
      date: initialDateStr,
      recurring: Boolean(defaultValues?.recurring),
      note: defaultValues?.note || "",
    },
  });

  const onSubmit = async (data: IncomeFormInputs) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const parsedAmount = Number(data.amount);
      const computedMonth = data.date.slice(0, 7);

      const url = isEditing ? `/api/income/${docId}` : "/api/income";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          source: data.source,
          date: data.date,
          month: computedMonth,
          recurring: Boolean(data.recurring),
          note: data.note || "",
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setErrorMsg(resData.error || `Failed to ${isEditing ? "update" : "add"} income. Please try again.`);
        setLoading(false);
        return;
      }

      router.refresh();
      onSuccess();
    } catch (err: unknown) {
      console.error("Income submit error:", err);
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

      {/* Source Dropdown */}
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Source <span className="text-expense">*</span>
        </label>
        <select
          {...register("source", { required: "Source is required" })}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
        >
          {INCOME_SOURCES.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>
        {errors.source && (
          <span className="text-xs text-expense mt-1 block">
            {errors.source.message}
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

      {/* Recurring Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="recurring"
          {...register("recurring")}
          className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent"
        />
        <label htmlFor="recurring" className="text-xs font-medium text-text-muted cursor-pointer">
          Recurring Monthly Income
        </label>
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Note (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="Monthly salary or payout details..."
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
        {loading ? (isEditing ? "Updating..." : "Adding Income...") : isEditing ? "Update" : "Add Income"}
      </button>
    </form>
  );
}
