import Expense from "@/models/Expense";
import Income from "@/models/Income";
import { ExpenseCategory, IncomeSource, EXPENSE_CATEGORIES, INCOME_SOURCES } from "@/types";
import { getPkMonth } from "@/lib/dates";
import { ExtractedTransaction } from "@/lib/groq";

function formatRs(amount: number): string {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

let expenseIndexReady: Promise<void> | null = null;
let incomeIndexReady: Promise<void> | null = null;

async function ensureEntryIndexes(): Promise<void> {
  if (!expenseIndexReady) {
    expenseIndexReady = Expense.init().then(() => undefined);
  }
  if (!incomeIndexReady) {
    incomeIndexReady = Income.init().then(() => undefined);
  }
  await Promise.all([expenseIndexReady, incomeIndexReady]);
}

export interface SaveEntriesInput {
  userId: string;
  messageId: string;
  entries: ExtractedTransaction[];
  source: "voice" | "whatsapp";
}

export interface SaveEntriesResult {
  savedCount: number;
  summaryLines: string[];
}

/**
 * Saves extracted transactions to the database idempotently.
 * Uses waMessageId + waIndex as a unique key so retries don't create duplicates.
 */
export async function saveEntries({
  userId,
  messageId,
  entries,
  source,
}: SaveEntriesInput): Promise<SaveEntriesResult> {
  await ensureEntryIndexes();

  const now = new Date();
  const month = getPkMonth(now);
  const summaryLines: string[] = [];
  let savedCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const sign = entry.type === "income" ? "+" : "-";
    const line = `${entry.category} — ${sign}Rs. ${formatRs(entry.amount)}`;

    try {
      if (entry.type === "income") {
        const validSource = INCOME_SOURCES.includes(entry.category as IncomeSource)
          ? (entry.category as IncomeSource)
          : "Other";
        await Income.create({
          userId,
          amount: entry.amount,
          source: validSource,
          note: entry.note,
          date: now,
          month,
          waMessageId: messageId,
          waIndex: i,
        });
      } else {
        const validCategory = EXPENSE_CATEGORIES.includes(entry.category as ExpenseCategory)
          ? (entry.category as ExpenseCategory)
          : "Other";
        await Expense.create({
          userId,
          amount: entry.amount,
          category: validCategory,
          note: entry.note,
          date: now,
          month,
          source,
          waMessageId: messageId,
          waIndex: i,
        });
      }
      savedCount++;
      summaryLines.push(line);
    } catch (err: unknown) {
      const mongoErr = err as { code?: number };
      if (mongoErr?.code === 11000) {
        // Already saved (idempotent retry) — count it as saved
        savedCount++;
        summaryLines.push(line);
        continue;
      }
      throw err;
    }
  }

  return { savedCount, summaryLines };
}
