import mongoose, { Types } from "mongoose";
import Budget from "@/models/Budget";
import { BUDGET_CATEGORIES, BUDGET_TOTAL } from "@/types";

export const WARN_PERCENT = 80;
export const OVER_PERCENT = 100;

export interface BudgetStatus {
  category: string;
  budget: number;
  spent: number;
  percent: number;
  level: "ok" | "warn" | "over";
}

/**
 * Loads effective budgets for a user and month.
 * Resolution:
 * 1. An "only" doc for (category, month) takes priority.
 * 2. Else the "from" doc for category with the greatest month <= requested month.
 * 3. Amount <= 0 (or no doc) means no budget.
 */
export async function getEffectiveBudgets(
  userId: string | Types.ObjectId,
  month: string
): Promise<Record<string, number>> {
  const userObjId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const docs = await Budget.find({
    userId: userObjId,
    $or: [
      { scope: "only", month },
      { scope: "from", month: { $lte: month } },
    ],
  }).lean();

  const byCategory: Record<string, typeof docs> = {};
  for (const doc of docs) {
    if (!byCategory[doc.category]) {
      byCategory[doc.category] = [];
    }
    byCategory[doc.category].push(doc);
  }

  const effective: Record<string, number> = {};

  for (const category of BUDGET_CATEGORIES) {
    const catDocs = byCategory[category];
    if (!catDocs || catDocs.length === 0) continue;

    // 1. "only" document for this exact month
    const onlyDoc = catDocs.find(
      (d) => d.scope === "only" && d.month === month
    );
    if (onlyDoc) {
      if (onlyDoc.amount > 0) {
        effective[category] = onlyDoc.amount;
      }
      continue;
    }

    // 2. "from" document with greatest month <= requested month
    const fromDocs = catDocs
      .filter((d) => d.scope === "from" && d.month <= month)
      .sort((a, b) => b.month.localeCompare(a.month));

    if (fromDocs.length > 0 && fromDocs[0].amount > 0) {
      effective[category] = fromDocs[0].amount;
    }
  }

  return effective;
}

/**
 * Computes status for all categories that have a budget.
 */
export function computeBudgetStatus(
  spentByCategory: Record<string, number>,
  totalSpent: number,
  budgets: Record<string, number>
): Array<BudgetStatus> {
  const statuses: BudgetStatus[] = [];

  const categoriesToProcess: string[] = [];
  if (budgets[BUDGET_TOTAL] !== undefined) {
    categoriesToProcess.push(BUDGET_TOTAL);
  }
  for (const cat of BUDGET_CATEGORIES) {
    if (cat !== BUDGET_TOTAL && budgets[cat] !== undefined) {
      categoriesToProcess.push(cat);
    }
  }

  for (const cat of categoriesToProcess) {
    const budget = budgets[cat];
    if (budget === undefined || budget <= 0) continue;

    const spent = cat === BUDGET_TOTAL ? totalSpent : (spentByCategory[cat] || 0);
    const percent = Math.round((spent / budget) * 100);

    let level: "ok" | "warn" | "over" = "ok";
    if (percent >= OVER_PERCENT) {
      level = "over";
    } else if (percent >= WARN_PERCENT) {
      level = "warn";
    }

    statuses.push({
      category: cat,
      budget,
      spent,
      percent,
      level,
    });
  }

  return statuses;
}

/**
 * Checks whether spend crossed the 80% or 100% threshold during an update.
 * If both are crossed in a single update, "over" takes precedence.
 */
export function crossedThresholds(
  before: number,
  after: number,
  budget: number
): "warn" | "over" | null {
  if (budget <= 0) return null;

  const warnAmount = budget * (WARN_PERCENT / 100);
  const overAmount = budget * (OVER_PERCENT / 100);

  if (before < overAmount && after >= overAmount) {
    return "over";
  }

  if (before < warnAmount && after >= warnAmount) {
    return "warn";
  }

  return null;
}
