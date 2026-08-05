import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import { AppError } from "@/lib/AppError";

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth(req);
  } catch {
    throw new AppError("Unauthorized", 401);
  }

  await connectToDatabase();
  const userObjId = new mongoose.Types.ObjectId(userId);

  const incomes = await Income.find({ userId: userObjId }).sort({ date: 1 }).lean();
  const expenses = await Expense.find({ userId: userObjId }).sort({ date: 1 }).lean();

  const rows: string[] = [
    "Type,Amount,Category/Source,Date,PaymentMethod,Note",
  ];

  for (const inc of incomes) {
    const date = new Date(inc.date).toISOString().slice(0, 10);
    const note = (inc.note || "").replace(/"/g, '""');
    rows.push(`Income,${inc.amount},"${inc.source}",${date},,\"${note}\"`);
  }

  for (const exp of expenses) {
    const date = new Date(exp.date).toISOString().slice(0, 10);
    const note = (exp.note || "").replace(/"/g, '""');
    const pm = exp.paymentMethod || "";
    rows.push(`Expense,${exp.amount},"${exp.category}",${date},${pm},"${note}"`);
  }

  const csv = rows.join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="hisab-kitab-export.csv"',
    },
  });
}
