import WhatsAppMessage from "@/models/WhatsAppMessage";
import Expense from "@/models/Expense";
import Income from "@/models/Income";

function pluralEntry(n: number): string {
  return n === 1 ? "entry" : "entries";
}

export interface UndoStartResult {
  reply: string;
}

/**
 * Initiates the undo flow: finds the most recent "done" message for the user
 * and sets a 5-minute delete-pending window.
 */
export async function startUndo(
  userId: string
): Promise<UndoStartResult> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const doc = await WhatsAppMessage.findOneAndUpdate(
    {
      userId,
      status: "done",
      entryCount: { $gt: 0 },
      deletedAt: { $exists: false },
      createdAt: { $gt: cutoff },
      deletePendingUntil: { $exists: false },
    },
    {
      $set: { deletePendingUntil: new Date(Date.now() + 5 * 60 * 1000) },
    },
    {
      sort: { createdAt: -1 },
      returnDocument: "after",
    }
  );

  if (!doc) {
    return { reply: "No recent entry to delete." };
  }

  const summary = doc.summaryLines.join("; ");
  return {
    reply: `Delete ${doc.entryCount} ${pluralEntry(doc.entryCount)}? ${summary} — reply YES to delete or NO to cancel.`,
  };
}

export interface UndoConfirmResult {
  reply: string;
}

/**
 * Confirms the pending undo: atomically marks the message as deleted
 * and removes all associated entries.
 */
export async function confirmUndo(
  userId: string
): Promise<UndoConfirmResult | null> {
  const now = new Date();

  const doc = await WhatsAppMessage.findOneAndUpdate(
    {
      userId,
      deletePendingUntil: { $gt: now },
      deletedAt: { $exists: false },
    },
    {
      $set: { deletedAt: now },
      $unset: { deletePendingUntil: 1 },
    },
    {
      sort: { createdAt: -1 },
      returnDocument: "after",
    }
  );

  if (!doc) {
    return null;
  }

  try {
    await Expense.deleteMany({ userId, waMessageId: doc.messageId });
    await Income.deleteMany({ userId, waMessageId: doc.messageId });
  } catch {
    // Rollback the deletedAt mark so user can retry
    await WhatsAppMessage.updateOne(
      { _id: doc._id },
      { $unset: { deletedAt: 1 } }
    );
    return { reply: "Couldn't delete right now. Please try again." };
  }

  const summary = doc.summaryLines.join("; ");
  return {
    reply: `🗑️ Deleted ${doc.entryCount} ${pluralEntry(doc.entryCount)}: ${summary}`,
  };
}

/**
 * Cancels the pending undo.
 */
export async function cancelUndo(userId: string): Promise<string> {
  await WhatsAppMessage.updateOne(
    {
      userId,
      deletePendingUntil: { $exists: true },
      deletedAt: { $exists: false },
    },
    { $unset: { deletePendingUntil: 1 } }
  );
  return "Okay, nothing was deleted.";
}
