import { TransactionItem } from "@/components/server/RecentActivity";

export interface WeekGroup {
  weekLabel: string;
  income: TransactionItem[];
  expense: TransactionItem[];
  all: TransactionItem[];
  totalIn: number;
  totalOut: number;
}

// Group transactions by week
export function groupTransactionsByWeek(
  transactions: TransactionItem[],
  selectedMonth: string // "YYYY-MM"
): WeekGroup[] {
  if (!transactions || transactions.length === 0) return [];

  const [yearStr, monthStr] = selectedMonth.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1; // 0-indexed

  // Month abbreviation, e.g. "Aug"
  const dateObj = new Date(year, monthIdx, 1);
  const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });

  // Get total days in month
  const totalDaysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  // Define 5 week buckets (1-7, 8-14, 15-21, 22-28, 29-end)
  const ranges = [
    { start: 1, end: 7 },
    { start: 8, end: 14 },
    { start: 15, end: 21 },
    { start: 22, end: 28 },
    { start: 29, end: totalDaysInMonth },
  ];

  const weeks: WeekGroup[] = [];

  for (const range of ranges) {
    if (range.start > totalDaysInMonth) break;
    const endDay = Math.min(range.end, totalDaysInMonth);

    const weekTransactions = transactions.filter((tx) => {
      const d = new Date(tx.date);
      const day = d.getDate();
      return day >= range.start && day <= endDay;
    });

    if (weekTransactions.length === 0) continue;

    // Sort date desc
    weekTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const income = weekTransactions.filter((tx) => tx.type === "income");
    const expense = weekTransactions.filter((tx) => tx.type === "expense");

    const totalIn = income.reduce((sum, tx) => sum + tx.amount, 0);
    const totalOut = expense.reduce((sum, tx) => sum + tx.amount, 0);

    const weekLabel = `${monthName} ${range.start} – ${monthName} ${endDay}`;

    weeks.push({
      weekLabel,
      income,
      expense,
      all: weekTransactions,
      totalIn,
      totalOut,
    });
  }

  return weeks;
}
