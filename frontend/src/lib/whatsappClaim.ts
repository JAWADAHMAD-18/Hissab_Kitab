import WhatsAppMessage from "@/models/WhatsAppMessage";

const STALE_THRESHOLD_MS = 90_000; // 90 seconds
const TTL_DAYS = 7;

let indexReady: Promise<void> | null = null;

async function ensureIndexes(): Promise<void> {
  if (!indexReady) {
    indexReady = WhatsAppMessage.init().then(() => undefined);
  }
  return indexReady;
}

export interface ClaimResult {
  claimed: boolean;
  reprocessing: boolean;
}

/**
 * Attempts to claim a WhatsApp message by its Meta message ID.
 * Returns { claimed: true } if this invocation should process the message.
 * Returns { claimed: false } if another invocation already handled or is handling it.
 * If reprocessing is true, it means a stale "processing" claim was taken over.
 */
export async function claimMessage(
  messageId: string,
  from: string,
  type: string
): Promise<ClaimResult> {
  await ensureIndexes();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_DAYS * 24 * 60 * 60 * 1000);

  try {
    await WhatsAppMessage.create({
      messageId,
      from,
      type,
      status: "processing",
      expiresAt,
    });
    return { claimed: true, reprocessing: false };
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr?.code !== 11000) {
      throw err;
    }
  }

  // Duplicate key — check existing document
  const existing = await WhatsAppMessage.findOne({ messageId }).lean();
  if (!existing) {
    // Extremely rare race: doc was TTL'd between our insert attempt and this find
    return { claimed: false, reprocessing: false };
  }

  if (existing.status === "done") {
    return { claimed: false, reprocessing: false };
  }

  // Status is "processing" — check if stale
  const createdAt = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
  if (now.getTime() - createdAt < STALE_THRESHOLD_MS) {
    // Another invocation is actively handling it
    return { claimed: false, reprocessing: false };
  }

  // Stale claim — attempt atomic takeover
  const staleThreshold = new Date(now.getTime() - STALE_THRESHOLD_MS);
  const taken = await WhatsAppMessage.findOneAndUpdate(
    {
      messageId,
      status: "processing",
      createdAt: { $lt: staleThreshold },
    },
    { $set: { createdAt: now } },
    { returnDocument: "after" }
  );

  if (!taken) {
    return { claimed: false, reprocessing: false };
  }

  return { claimed: true, reprocessing: true };
}

/**
 * Marks a claimed message as successfully processed.
 */
export async function finalizeClaim(
  messageId: string,
  userId: string | undefined,
  entryCount: number,
  summaryLines: string[]
): Promise<void> {
  await WhatsAppMessage.updateOne(
    { messageId },
    {
      $set: {
        status: "done",
        ...(userId ? { userId } : {}),
        entryCount,
        summaryLines,
      },
    }
  );
}

/**
 * Releases a claim so a future retry can re-process the message.
 * Used on processing errors.
 */
export async function releaseClaim(messageId: string): Promise<void> {
  await WhatsAppMessage.deleteOne({ messageId });
}
