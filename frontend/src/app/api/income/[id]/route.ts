import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Income from "@/models/Income";
import { INCOME_SOURCES } from "@/types";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";

export const PATCH = withErrorHandler(
  async (req: NextRequest, context?: { params: Promise<{ id: string }> }) => {
    if (!context) throw new AppError("Route params missing", 400);
    const { id } = await context.params;
    const userId = await requireAuth(req);
    await connectToDatabase();

    const existing = await Income.findOne({ _id: id, userId });
    if (!existing) {
      throw new AppError("Income entry not found or unauthorized", 404);
    }

    const body = await req.json();
    const { amount, source, date, month, recurring, note } = body;

    if (amount !== undefined) {
      if (typeof amount !== "number" || amount < 0) {
        throw new AppError("Valid non-negative amount is required", 400);
      }
      existing.amount = amount;
    }

    if (source !== undefined) {
      if (!INCOME_SOURCES.includes(source)) {
        throw new AppError(
          `Invalid income source. Allowed: ${INCOME_SOURCES.join(", ")}`,
          400
        );
      }
      existing.source = source;
    }

    if (date !== undefined) {
      const entryDate = new Date(date);
      if (isNaN(entryDate.getTime())) {
        throw new AppError("Invalid date format", 400);
      }
      existing.date = entryDate;
      existing.month =
        month && /^\d{4}-\d{2}$/.test(month)
          ? month
          : entryDate.toISOString().slice(0, 7);
    }

    if (recurring !== undefined) {
      existing.recurring = Boolean(recurring);
    }

    if (note !== undefined) {
      existing.note = note;
    }

    await existing.save();
    return success(existing);
  }
);

export const DELETE = withErrorHandler(
  async (req: NextRequest, context?: { params: Promise<{ id: string }> }) => {
    if (!context) throw new AppError("Route params missing", 400);
    const { id } = await context.params;
    const userId = await requireAuth(req);
    await connectToDatabase();

    const existing = await Income.findOne({ _id: id, userId });
    if (!existing) {
      throw new AppError("Income entry not found or unauthorized", 404);
    }

    await Income.deleteOne({ _id: id, userId });
    return success({ deleted: true });
  }
);
