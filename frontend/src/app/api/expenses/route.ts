import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Expense from "@/models/Expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, EXPENSE_SOURCES } from "@/types";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const category = searchParams.get("category");

  const query: Record<string, unknown> = { userId };
  if (month) {
    query.month = month;
  }
  if (category) {
    query.category = category;
  }

  const expenses = await Expense.find(query).sort({ date: -1 }).lean();

  return success(expenses);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  const body = await req.json();

  const { amount, category, date, month, paymentMethod, note, source } = body;

  if (amount === undefined || amount === null || typeof amount !== "number" || amount < 0) {
    throw new AppError("Valid non-negative amount is required", 400);
  }

  if (!category || !EXPENSE_CATEGORIES.includes(category)) {
    throw new AppError(
      `Invalid expense category. Allowed: ${EXPENSE_CATEGORIES.join(", ")}`,
      400
    );
  }

  if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
    throw new AppError(
      `Invalid payment method. Allowed: ${PAYMENT_METHODS.join(", ")}`,
      400
    );
  }

  const entrySource = source || "manual";
  if (!EXPENSE_SOURCES.includes(entrySource)) {
    throw new AppError(
      `Invalid source. Allowed: ${EXPENSE_SOURCES.join(", ")}`,
      400
    );
  }

  const entryDate = date ? new Date(date) : new Date();
  if (isNaN(entryDate.getTime())) {
    throw new AppError("Invalid date format", 400);
  }

  const computedMonth =
    month && /^\d{4}-\d{2}$/.test(month)
      ? month
      : entryDate.toISOString().slice(0, 7);

  await connectToDatabase();

  const expense = await Expense.create({
    userId,
    amount,
    category,
    date: entryDate,
    month: computedMonth,
    paymentMethod: paymentMethod || undefined,
    note: note || "",
    source: entrySource,
  });

  return success(expense, 201);
});
