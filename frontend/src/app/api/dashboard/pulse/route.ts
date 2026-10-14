import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { checkRateLimit } from "@/lib/rateLimit";

const MONTH_REGEX = /^\d{4}-\d{2}$/;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  if (!month || !MONTH_REGEX.test(month)) {
    throw new AppError("Invalid or missing month parameter (expected YYYY-MM)", 400);
  }

  // Rate limit: 20 calls per 60s window per user
  const { allowed } = await checkRateLimit({
    key: `pulse:user:${userId}`,
    limit: 20,
    windowSeconds: 60,
  });

  if (!allowed) {
    throw new AppError("Rate limit exceeded. Please try again later.", 429);
  }

  await connectToDatabase();
  const userObjId = new mongoose.Types.ObjectId(userId);

  // Cheap aggregation over index: count and max(updatedAt) for entries up to the selected month
  const matchQuery = {
    userId: userObjId,
    month: { $lte: month },
  };

  const [incomePulse, expensePulse] = await Promise.all([
    Income.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          maxUpdated: { $max: "$updatedAt" },
        },
      },
    ]),
    Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          maxUpdated: { $max: "$updatedAt" },
        },
      },
    ]),
  ]);

  const incCount = incomePulse[0]?.count ?? 0;
  const incMaxUpdated = incomePulse[0]?.maxUpdated
    ? new Date(incomePulse[0].maxUpdated).getTime()
    : 0;

  const expCount = expensePulse[0]?.count ?? 0;
  const expMaxUpdated = expensePulse[0]?.maxUpdated
    ? new Date(expensePulse[0].maxUpdated).getTime()
    : 0;

  const signature = `inc:${incCount}:${incMaxUpdated}|exp:${expCount}:${expMaxUpdated}`;

  const res = success({ signature });
  res.headers.set("Cache-Control", "no-store");
  return res;
});
