import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import { TransactionItem } from "@/components/server/RecentActivity";
import { groupTransactionsByWeek } from "@/lib/groupTransactionsByWeek";
import { MonthSwitcher } from "@/components/client/MonthSwitcher";
import { TransactionsListClient } from "@/components/client/TransactionsListClient";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const selectedMonth =
    resolvedParams?.month && /^\d{4}-\d{2}$/.test(resolvedParams.month)
      ? resolvedParams.month
      : currentMonthStr;

  await connectToDatabase();

  const userObjId = new mongoose.Types.ObjectId(userId);

  // Fetch all income for selected month
  const monthIncomes = await Income.find({
    userId: userObjId,
    month: selectedMonth,
  })
    .sort({ date: -1 })
    .lean();

  // Fetch all expenses for selected month
  const monthExpenses = await Expense.find({
    userId: userObjId,
    month: selectedMonth,
  })
    .sort({ date: -1 })
    .lean();

  // Map to TransactionItem
  const mappedIncomes: TransactionItem[] = monthIncomes.map((inc) => ({
    id: String(inc._id),
    _id: String(inc._id),
    type: "income",
    label: inc.source,
    source: inc.source,
    amount: inc.amount,
    date: new Date(inc.date).toISOString(),
    recurring: inc.recurring,
    note: inc.note || undefined,
  }));

  const mappedExpenses: TransactionItem[] = monthExpenses.map((exp) => ({
    id: String(exp._id),
    _id: String(exp._id),
    type: "expense",
    label: exp.category,
    category: exp.category,
    amount: exp.amount,
    date: new Date(exp.date).toISOString(),
    paymentMethod: exp.paymentMethod,
    note: exp.note || undefined,
  }));

  // Merge and sort by date desc
  const allTransactions: TransactionItem[] = [
    ...mappedIncomes,
    ...mappedExpenses,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const weeks = groupTransactionsByWeek(allTransactions, selectedMonth);

  const formattedMonthLabel = new Date(
    selectedMonth + "-01"
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 lg:py-12 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Transactions
          </h1>
          <p className="text-sm text-text-muted mt-1">{formattedMonthLabel}</p>
        </div>
        <MonthSwitcher
          selectedMonth={selectedMonth}
          currentMonth={currentMonthStr}
        />
      </div>

      {/* Transactions list client */}
      <TransactionsListClient weeks={weeks} />
    </div>
  );
}
