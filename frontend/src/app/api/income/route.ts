import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Income from "@/models/Income";
import { INCOME_SOURCES } from "@/types";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  const query: Record<string, unknown> = { userId };
  if (month) {
    query.month = month;
  }

  const incomes = await Income.find(query).sort({ date: -1 }).lean();

  return success(incomes);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  const body = await req.json();

  const { amount, source, date, month, recurring, note } = body;

  if (amount === undefined || amount === null || typeof amount !== "number" || amount < 0) {
    throw new AppError("Valid non-negative amount is required", 400);
  }

  if (!source || !INCOME_SOURCES.includes(source)) {
    throw new AppError(
      `Invalid income source. Allowed: ${INCOME_SOURCES.join(", ")}`,
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

  const income = await Income.create({
    userId,
    amount,
    source,
    date: entryDate,
    month: computedMonth,
    recurring: Boolean(recurring),
    note: note || "",
  });

  return success(income, 201);
});
