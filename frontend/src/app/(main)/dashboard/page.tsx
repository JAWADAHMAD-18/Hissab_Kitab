import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import { MonthSwitcher } from "@/components/client/MonthSwitcher";
import { QuickAddButtons } from "@/components/client/QuickAddButtons";
import { DashboardStats } from "@/components/server/DashboardStats";
import { MonthRunway } from "@/components/server/MonthRunway";
import { CategoryBreakdown } from "@/components/server/CategoryBreakdown";
import { BudgetAlert } from "@/components/server/BudgetAlert";
import { RecentActivity, TransactionItem } from "@/components/server/RecentActivity";
import { DownloadStatementButton } from "@/components/client/DownloadStatementButton";
import { getOnboardingState } from "@/lib/onboarding";
import { getEffectiveBudgets, computeBudgetStatus } from "@/lib/budgets";
import { OnboardingWizard } from "@/components/client/onboarding/OnboardingWizard";
import { DashboardLiveSync } from "@/components/client/DashboardLiveSync";
import { InstallPrompt } from "@/components/client/InstallPrompt";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
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

  // Parallel fetch — all queries run simultaneously, total wait = slowest single query
  const [
    monthExpenses,
    monthIncomes,
    prevIncomeAgg,
    prevExpenseAgg,
    onboarding,
    effectiveBudgets,
  ] = await Promise.all([
    Expense.find({
      userId: userObjId,
      month: selectedMonth,
    })
      .sort({ date: -1 })
      .lean(),
    Income.find({
      userId: userObjId,
      month: selectedMonth,
    })
      .sort({ date: -1 })
      .lean(),
    Income.aggregate([
      { $match: { userId: userObjId, month: { $lt: selectedMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjId, month: { $lt: selectedMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    getOnboardingState(userId),
    getEffectiveBudgets(userId, selectedMonth).catch(() => ({})),
  ]);

  const { showOnboarding, firstName } = onboarding;

  const spentThisMonth = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Category sum calculation
  const categoryMap: Record<string, number> = {};
  monthExpenses.forEach((exp) => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
  });

  const budgetStatuses = computeBudgetStatus(
    categoryMap,
    spentThisMonth,
    effectiveBudgets
  );

  const categorySums = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const incomeThisMonth = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingThisMonth = incomeThisMonth - spentThisMonth;

  const prevIncomeTotal = prevIncomeAgg[0]?.total || 0;
  const prevExpenseTotal = prevExpenseAgg[0]?.total || 0;
  const carriedForward = prevIncomeTotal - prevExpenseTotal;

  // 4. Combined last ~8 transactions for selected month
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

  // All transactions sorted by date desc — used for RecentActivity (sliced) and statement (full)
  const allSortedTransactions: TransactionItem[] = [...mappedIncomes, ...mappedExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const transactions = allSortedTransactions.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 flex flex-col gap-8">
      {/* Top Row: Switcher, Statement Download & Quick Add Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <MonthSwitcher
          selectedMonth={selectedMonth}
          currentMonth={currentMonthStr}
        />
        <DownloadStatementButton
          monthLabel={new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          selectedMonth={selectedMonth}
          transactions={allSortedTransactions}
          totalIncome={incomeThisMonth}
          totalExpense={spentThisMonth}
          balance={incomeThisMonth - spentThisMonth}
        />
        <QuickAddButtons />
      </div>

      {/* Budget Warning / Over Alert Banner (Current Month Only) */}
      {selectedMonth === currentMonthStr && (
        <BudgetAlert statuses={budgetStatuses} />
      )}

      {/* Summary Stats Cards */}
      <DashboardStats
        spentThisMonth={spentThisMonth}
        remainingThisMonth={remainingThisMonth}
        incomeThisMonth={incomeThisMonth}
        carriedForward={carriedForward}
      />

      {/* Month Runway Widget (Current Month Only) */}
      <MonthRunway
        selectedMonth={selectedMonth}
        currentMonth={currentMonthStr}
        incomeThisMonth={incomeThisMonth}
        spentThisMonth={spentThisMonth}
      />

      {/* Breakdown & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <CategoryBreakdown
          categorySums={categorySums}
          totalSpent={spentThisMonth}
          budgets={effectiveBudgets}
          statuses={budgetStatuses}
          month={selectedMonth}
        />
        <RecentActivity transactions={transactions} />
      </div>

      {showOnboarding && <OnboardingWizard firstName={firstName} />}
      {!showOnboarding && <InstallPrompt />}
      <DashboardLiveSync month={selectedMonth} />
    </div>
  );
}
