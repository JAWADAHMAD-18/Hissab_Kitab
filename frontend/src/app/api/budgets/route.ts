import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Budget from "@/models/Budget";
import { getEffectiveBudgets } from "@/lib/budgets";
import { BUDGET_CATEGORIES, BudgetCategory } from "@/types";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { checkRateLimit } from "@/lib/rateLimit";

const MONTH_REGEX = /^\d{4}-\d{2}$/;
const MAX_AMOUNT = 10_000_000;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  if (!month || !MONTH_REGEX.test(month)) {
    throw new AppError("Invalid or missing month parameter (expected YYYY-MM)", 400);
  }

  await connectToDatabase();
  const budgets = await getEffectiveBudgets(userId, month);

  return success({ budgets });
});

export const PUT = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);

  // Rate limit: 30 calls per 600s window per user
  const { allowed } = await checkRateLimit({
    key: `budgets:user:${userId}`,
    limit: 30,
    windowSeconds: 600,
  });

  if (!allowed) {
    throw new AppError("Rate limit exceeded. Please try again later.", 429);
  }

  let body: {
    month?: string;
    scope?: string;
    items?: Array<{ category?: string; amount?: unknown }>;
  };

  try {
    body = await req.json();
  } catch {
    throw new AppError("Invalid JSON body", 400);
  }

  const { month, scope, items } = body;

  if (!month || typeof month !== "string" || !MONTH_REGEX.test(month)) {
    throw new AppError("Invalid or missing month parameter (expected YYYY-MM)", 400);
  }

  if (scope !== "from" && scope !== "only") {
    throw new AppError('Scope must be either "from" or "only"', 400);
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > 10) {
    throw new AppError("Items must be an array of 1 to 10 budget entries", 400);
  }

  const seenCategories = new Set<string>();
  const validItems: Array<{ category: BudgetCategory; amount: number }> = [];

  for (const item of items) {
    if (!item || typeof item !== "object") {
      throw new AppError("Invalid item in items array", 400);
    }

    const { category, amount } = item;

    if (!category || !BUDGET_CATEGORIES.includes(category as BudgetCategory)) {
      throw new AppError(`Invalid category: ${category}`, 400);
    }

    if (seenCategories.has(category)) {
      throw new AppError(`Duplicate category in items: ${category}`, 400);
    }
    seenCategories.add(category);

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount > MAX_AMOUNT
    ) {
      throw new AppError(
        `Amount for ${category} must be a number between 0 and 10,000,000`,
        400
      );
    }

    validItems.push({
      category: category as BudgetCategory,
      amount,
    });
  }

  await connectToDatabase();
  const userObjId = new mongoose.Types.ObjectId(userId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: any[] = [];

  // If scope is "from", delete any later "from" docs for these categories
  // so the new default reliably applies from M onward
  if (scope === "from") {
    for (const item of validItems) {
      ops.push({
        deleteMany: {
          filter: {
            userId: userObjId,
            category: item.category,
            scope: "from",
            month: { $gt: month },
          },
        },
      });
    }
  }

  for (const item of validItems) {
    ops.push({
      updateOne: {
        filter: {
          userId: userObjId,
          category: item.category,
          scope,
          month,
        },
        update: {
          $set: {
            amount: item.amount,
          },
        },
        upsert: true,
      },
    });
  }

  await Budget.bulkWrite(ops);

  return success({ saved: validItems.length });
});
