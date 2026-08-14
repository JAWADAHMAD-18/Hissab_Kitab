import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { failure, success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import User from "@/models/User";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import { getGroqClient } from "@/lib/groq";
import { sendWeeklyReportEmail } from "@/lib/brevo";

function verifyCronAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return failure("Unauthorized", 401);
  }

  return null;
}

function formatWeekLabel(monday: Date, sunday: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const monStr = monday.toLocaleDateString("en-US", options);
  const sunStr = sunday.toLocaleDateString("en-US", options);
  const year = monday.getFullYear();
  return `${monStr} – ${sunStr}, ${year}`;
}

interface UserWeekStats {
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  topCategory: string;
  topCategoryAmount: number;
}

async function fetchUserWeekStats(
  userObjId: mongoose.Types.ObjectId,
  monday: Date,
  sunday: Date
): Promise<UserWeekStats> {
  const [incomeAgg, expenseAgg, categoryAgg, incomeCount, expenseCount] = await Promise.all([
    Income.aggregate([
      { $match: { userId: userObjId, date: { $gte: monday, $lte: sunday } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjId, date: { $gte: monday, $lte: sunday } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjId, date: { $gte: monday, $lte: sunday } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]),
    Income.countDocuments({ userId: userObjId, date: { $gte: monday, $lte: sunday } }),
    Expense.countDocuments({ userId: userObjId, date: { $gte: monday, $lte: sunday } }),
  ]);

  const totalIncome = incomeAgg[0]?.total || 0;
  const totalExpense = expenseAgg[0]?.total || 0;
  const topCategory = categoryAgg[0]?._id || "Other";
  const topCategoryAmount = categoryAgg[0]?.total || 0;

  return {
    totalIncome,
    totalExpense,
    transactionCount: incomeCount + expenseCount,
    topCategory,
    topCategoryAmount,
  };
}

async function processUserReport(
  user: { _id: mongoose.Types.ObjectId; name: string; email: string },
  monday: Date,
  sunday: Date
): Promise<"sent" | "skipped"> {
  const stats = await fetchUserWeekStats(user._id, monday, sunday);

  if (stats.transactionCount === 0) {
    return "skipped";
  }

  const firstName = user.name.split(" ")[0] || user.name;
  const weekLabel = formatWeekLabel(monday, sunday);

  const prompt = [
    `Week: ${weekLabel}`,
    `Total weekly income: Rs. ${stats.totalIncome.toLocaleString("en-IN")}`,
    `Total weekly expenses: Rs. ${stats.totalExpense.toLocaleString("en-IN")}`,
    `Top spending category: ${stats.topCategory} (Rs. ${stats.topCategoryAmount.toLocaleString("en-IN")})`,
  ].join("\n");

  let narrative: string;
  try {
    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, practical personal finance coach writing a brief weekly email check-in for Hisab Kitab. Write exactly 1-2 short, casual sentences. Mention the top spending category and whether it was a light or heavy week overall. Keep it concise, friendly, and plain text. Do NOT use bullet points, markdown, or headers.",
        },
        {
          role: "user",
          content: `Write the weekly check-in for ${firstName}.\n\n${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });
    narrative = completion.choices[0]?.message?.content?.trim() || "Here is your weekly summary.";
  } catch (err) {
    console.error(`Failed to generate weekly narrative for ${user.email}:`, err);
    narrative = "Here is a quick summary of your week's activity. Keep tracking and keep your budget in check!";
  }

  await sendWeeklyReportEmail({
    toEmail: user.email,
    toName: user.name,
    weekLabel,
    narrative,
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
  const weekStartParam = searchParams.get("weekStart");

  if ((userIdParam && !weekStartParam) || (!userIdParam && weekStartParam)) {
    throw new AppError("Provide both userId and weekStart together, or neither", 400);
  }

  let monday: Date;
  let sunday: Date;

  if (weekStartParam) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartParam)) {
      throw new AppError("weekStart must be in YYYY-MM-DD format", 400);
    }
    const [y, m, d] = weekStartParam.split("-").map(Number);
    monday = new Date(y, m - 1, d, 0, 0, 0, 0);
    sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
  } else {
    // Auto-calculate last completed week
    const now = new Date();
    const day = now.getDay();
    const diffToLastMonday = (day === 0 ? 6 : day - 1) + 7;
    monday = new Date(now);
    monday.setDate(now.getDate() - diffToLastMonday);
    monday.setHours(0, 0, 0, 0);

    sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
  }

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

  for (const user of users) {
    try {
      const result = await processUserReport(user, monday, sunday);
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
      console.error(`Weekly report failed for ${user.email}:`, err);
    }
  }

  return success({
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
    weekLabel: formatWeekLabel(monday, sunday),
    targetedUsers: users.length,
    sent,
    skipped,
    failed,
    failures,
  });
});

export const dynamic = "force-dynamic";
export const maxDuration = 300;
