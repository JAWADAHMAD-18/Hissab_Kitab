import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { failure, success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import User from "@/models/User";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import { generateMonthlyNarrative } from "@/lib/groq";
import { sendMonthlyReportEmail } from "@/lib/brevo";

// Vercel Cron (see frontend/vercel.json): runs at 06:00 UTC on the 1st of each month.
// Schedules are always UTC; this only takes effect once deployed to Vercel — it does nothing on localhost.

function getLastCompletedMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  const d = new Date(year, monthNum - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  return new Date(year, monthNum - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function verifyCronAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return failure("Unauthorized", 401);
  }

  return null;
}

interface UserMonthStats {
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  topCategory: string;
  topCategoryAmount: number;
  previousMonthExpense: number;
  expenseChangePercent: number | null;
}

async function fetchUserMonthStats(
  userObjId: mongoose.Types.ObjectId,
  month: string
): Promise<UserMonthStats> {
  const previousMonth = getPreviousMonth(month);

  const [incomeAgg, expenseAgg, categoryAgg, incomeCount, expenseCount, prevExpenseAgg] =
    await Promise.all([
      Income.aggregate([
        { $match: { userId: userObjId, month } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjId, month } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjId, month } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      Income.countDocuments({ userId: userObjId, month }),
      Expense.countDocuments({ userId: userObjId, month }),
      Expense.aggregate([
        { $match: { userId: userObjId, month: previousMonth } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

  const totalIncome = incomeAgg[0]?.total || 0;
  const totalExpense = expenseAgg[0]?.total || 0;
  const previousMonthExpense = prevExpenseAgg[0]?.total || 0;
  const topCategory = categoryAgg[0]?._id || "Other";
  const topCategoryAmount = categoryAgg[0]?.total || 0;

  const expenseChangePercent =
    previousMonthExpense === 0
      ? null
      : Math.round(((totalExpense - previousMonthExpense) / previousMonthExpense) * 100);

  return {
    totalIncome,
    totalExpense,
    transactionCount: incomeCount + expenseCount,
    topCategory,
    topCategoryAmount,
    previousMonthExpense,
    expenseChangePercent,
  };
}

async function processUserReport(
  user: { _id: mongoose.Types.ObjectId; name: string; email: string },
  month: string
): Promise<"sent" | "skipped"> {
  const stats = await fetchUserMonthStats(user._id, month);

  if (stats.transactionCount === 0) {
    return "skipped";
  }

  const monthLabel = formatMonthLabel(month);
  const { overview, tips } = await generateMonthlyNarrative({
    userName: user.name,
    monthLabel,
    totalIncome: stats.totalIncome,
    totalExpense: stats.totalExpense,
    topCategory: stats.topCategory,
    topCategoryAmount: stats.topCategoryAmount,
    expenseChangePercent: stats.expenseChangePercent,
  });

  await sendMonthlyReportEmail({
    toEmail: user.email,
    toName: user.name,
    monthLabel,
    overview,
    tips,
    totalIncome: stats.totalIncome,
    totalExpense: stats.totalExpense,
  });

  return "sent";
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const authFailure = verifyCronAuth(req);
  if (authFailure) return authFailure;

  const { searchParams } = new URL(req.url);
  const userIdParam = searchParams.get("userId");
  const monthParam = searchParams.get("month");

  if ((userIdParam && !monthParam) || (!userIdParam && monthParam)) {
    throw new AppError("Provide both userId and month together, or neither", 400);
  }

  if (monthParam && !/^\d{4}-\d{2}$/.test(monthParam)) {
    throw new AppError("month must be in YYYY-MM format", 400);
  }

  const month = monthParam || getLastCompletedMonth();

  await connectToDatabase();

  let users: { _id: mongoose.Types.ObjectId; name: string; email: string }[];

  if (userIdParam) {
    if (!mongoose.Types.ObjectId.isValid(userIdParam)) {
      throw new AppError("Invalid userId", 400);
    }

    const user = await User.findById(userIdParam).select("name email").lean();
    if (!user) {
      throw new AppError("User not found", 404);
    }

    users = [{ _id: user._id as mongoose.Types.ObjectId, name: user.name, email: user.email }];
  } else {
    const allUsers = await User.find({}).select("name email").lean();
    users = allUsers.map((u) => ({
      _id: new mongoose.Types.ObjectId(String(u._id)),
      name: u.name,
      email: u.email,
    }));
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const failures: { userId: string; email: string; error: string }[] = [];

  // Process sequentially — batch with a job queue if user count grows.
  for (const user of users) {
    try {
      const result = await processUserReport(user, month);
      if (result === "skipped") {
        skipped += 1;
      } else {
        sent += 1;
      }
    } catch (err) {
      failed += 1;
      failures.push({
        userId: String(user._id),
        email: user.email,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      console.error(`Monthly report failed for ${user.email}:`, err);
    }
  }

  return success({
    month,
    monthLabel: formatMonthLabel(month),
    targetedUsers: users.length,
    sent,
    skipped,
    failed,
    failures,
  });
});

export const dynamic = "force-dynamic";
export const maxDuration = 300;
