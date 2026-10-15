import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Expense from "@/models/Expense";
import { getEffectiveBudgets, crossedThresholds } from "@/lib/budgets";
import { BUDGET_TOTAL } from "@/types";
import { getPkMonth } from "@/lib/dates";
import {
  downloadMedia,
  getMediaUrl,
  normalizePhoneNumber,
  sendTextMessage,
} from "@/lib/whatsapp";
import { transcribeAudio, extractTransactionsFromMessage } from "@/lib/groq";
import { claimMessage, finalizeClaim, releaseClaim } from "@/lib/whatsappClaim";
import { saveEntries } from "@/lib/whatsappSave";
import { startUndo, confirmUndo, cancelUndo } from "@/lib/whatsappUndo";
import { checkRateLimit } from "@/lib/rateLimit";

// ─── Constants ──────────────────────────────────────────────────────────────

const HELP_MESSAGE =
  "Send an expense or deposit, e.g. 'aj shawarma 500 ka' or 'salary 50000 mili'. " +
  "You can send several in one message: 'chai 50, rickshaw 200'. " +
  "Voice notes work too. Send 'undo' to delete your last message's entries.";

const UNDO_COMMANDS = new Set([
  "undo", "del", "delete", "delete last", "remove",
  "galat", "galat ho gya", "last delete",
]);

const CONFIRM_COMMANDS = new Set([
  "yes", "y", "haan", "han", "ha", "ji", "ok", "confirm",
]);

const CANCEL_COMMANDS = new Set([
  "no", "nahi", "nai", "cancel",
]);

const AMOUNT_WORDS_REGEX =
  /sau|sou|hazar|hazaar|lakh|lac|crore|karor|ہزار|سو|لاکھ|کروڑ/i;

const DIGIT_REGEX = /[0-9\u0660-\u0669\u06F0-\u06F9]/;

const AMOUNT_CAP = 10_000_000;

const MAX_TEXT_LENGTH = 300;

// ─── Helpers ────────────────────────────────────────────────────────────────

function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signatureHeader) {
    return false;
  }

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

function formatRs(amount: number): string {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

async function findVerifiedUserByPhone(from: string) {
  const digits = normalizePhoneNumber(from);

  return User.findOne({
    whatsappVerified: true,
    whatsappNumber: { $in: [`+${digits}`, digits] },
  }).lean();
}

async function safeReply(to: string, body: string): Promise<void> {
  try {
    await sendTextMessage(to, body);
  } catch (err) {
    console.error("WhatsApp reply failed:", err);
  }
}

async function tryLinkUserByCode(from: string, code: string): Promise<boolean> {
  const user = await User.findOne({
    whatsappVerificationCode: code,
    whatsappVerificationExpiry: { $gt: new Date() },
  }).select("+whatsappVerificationCode +whatsappVerificationExpiry");

  if (!user) {
    return false;
  }

  user.whatsappNumber = `+${from}`;
  user.whatsappVerified = true;
  user.whatsappVerificationCode = undefined;
  user.whatsappVerificationExpiry = undefined;
  await user.save();

  await safeReply(
    from,
    "✅ Linked to Hisab Kitab! Send a voice note or text anytime to log an expense."
  );

  return true;
}

/**
 * Normalize text for command matching: trim, lowercase, collapse whitespace,
 * strip trailing punctuation (. ! ?).
 */
function normalizeForCommand(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

/**
 * Pre-filter for text messages: must contain a digit or an amount word.
 * Returns true if the text passes the pre-filter and should be sent to the LLM.
 */
function passesPreFilter(text: string): boolean {
  return DIGIT_REGEX.test(text) || AMOUNT_WORDS_REGEX.test(text);
}

// ─── Rate-limit helpers ─────────────────────────────────────────────────────

async function checkUserRateLimit(userId: string): Promise<boolean> {
  const { allowed } = await checkRateLimit({
    key: `wa:user:${userId}`,
    limit: 60,
    windowSeconds: 3600,
  });
  return allowed;
}

async function canSendUserBlockedReply(userId: string): Promise<boolean> {
  const { allowed } = await checkRateLimit({
    key: `wa:user-blocked-reply:${userId}`,
    limit: 1,
    windowSeconds: 600,
  });
  return allowed;
}

async function checkUnlinkedRateLimit(from: string): Promise<boolean> {
  const { allowed } = await checkRateLimit({
    key: `wa:unlinked:${from}`,
    limit: 3,
    windowSeconds: 3600,
  });
  return allowed;
}

// ─── Single-message handler ─────────────────────────────────────────────────

interface IncomingMessage {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  audio?: { id: string; mime_type?: string };
}

async function handleMessage(message: IncomingMessage): Promise<{
  outcome: string;
  entriesSaved: number;
  userId?: string;
}> {
  const { id: messageId, from, type } = message;

  // 1. Dedupe claim
  const claim = await claimMessage(messageId, from, type);
  if (!claim.claimed) {
    return { outcome: "duplicate", entriesSaved: 0 };
  }

  try {
    // 2. Linked-code check (text only)
    if (type === "text") {
      const bodyText = message.text?.body?.trim() ?? "";
      if (/^\d{6}$/.test(bodyText)) {
        const linked = await tryLinkUserByCode(from, bodyText);
        if (linked) {
          await finalizeClaim(messageId, undefined, 0, []);
          return { outcome: "linked", entriesSaved: 0 };
        }
        // Invalid code — fall through to user lookup
      }
    }

    // 3. Resolve user
    const user = await findVerifiedUserByPhone(from);
    if (!user) {
      // Unlinked rate limit
      const canReply = await checkUnlinkedRateLimit(from);
      if (canReply) {
        await safeReply(
          from,
          "This number isn't linked to a Hisab Kitab account yet. Connect it in Settings first."
        );
      }
      await finalizeClaim(messageId, undefined, 0, []);
      return { outcome: "unlinked", entriesSaved: 0 };
    }

    const userId = String(user._id);

    // 4. Per-user rate limit (before any Groq/Whisper call)
    if (type === "audio" || type === "text") {
      const allowed = await checkUserRateLimit(userId);
      if (!allowed) {
        const canReply = await canSendUserBlockedReply(userId);
        if (canReply) {
          await safeReply(
            from,
            "You're sending messages too fast. Please try again in a while."
          );
        }
        await finalizeClaim(messageId, userId, 0, []);
        return { outcome: "rate_limited", entriesSaved: 0, userId };
      }
    }

    // 5. Type handling
    let transcript: string | null = null;
    let entrySource: "voice" | "whatsapp";

    if (type === "audio") {
      // Audio path: download -> Whisper -> transcript
      const mediaId = message.audio?.id;
      if (!mediaId) {
        await safeReply(from, "Couldn't quite catch that — try recording again?");
        await finalizeClaim(messageId, userId, 0, []);
        return { outcome: "no_media_id", entriesSaved: 0, userId };
      }

      const mediaUrl = await getMediaUrl(mediaId);
      const audioBuffer = await downloadMedia(mediaUrl);
      const mimeType = message.audio?.mime_type || "audio/ogg";
      const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });

      transcript = await transcribeAudio(audioBlob);
      if (!transcript) {
        await safeReply(from, "Couldn't quite catch that — try recording again?");
        await finalizeClaim(messageId, userId, 0, []);
        return { outcome: "transcription_failed", entriesSaved: 0, userId };
      }

      entrySource = "voice";
    } else if (type === "text") {
      const bodyText = message.text?.body?.trim() ?? "";
      const normalized = normalizeForCommand(bodyText);

      // 6. Command matching
      if (UNDO_COMMANDS.has(normalized)) {
        const result = await startUndo(userId);
        await safeReply(from, result.reply);
        await finalizeClaim(messageId, userId, 0, []);
        return { outcome: "undo_start", entriesSaved: 0, userId };
      }

      if (CONFIRM_COMMANDS.has(normalized)) {
        const result = await confirmUndo(userId);
        if (result) {
          await safeReply(from, result.reply);
        } else {
          await safeReply(from, HELP_MESSAGE);
        }
        await finalizeClaim(messageId, userId, 0, []);
        return { outcome: "undo_confirm", entriesSaved: 0, userId };
      }

      if (CANCEL_COMMANDS.has(normalized)) {
        const reply = await cancelUndo(userId);
        await safeReply(from, reply);
        await finalizeClaim(messageId, userId, 0, []);
        return { outcome: "undo_cancel", entriesSaved: 0, userId };
      }

      // 7. Length guard
      if (bodyText.length > MAX_TEXT_LENGTH) {
        await safeReply(from, HELP_MESSAGE);
        await finalizeClaim(messageId, userId, 0, []);
        return { outcome: "too_long", entriesSaved: 0, userId };
      }

      // Pre-filter: must contain a digit or amount word
      if (!passesPreFilter(bodyText)) {
        await safeReply(from, HELP_MESSAGE);
        await finalizeClaim(messageId, userId, 0, []);
        return { outcome: "prefilter_fail", entriesSaved: 0, userId };
      }

      transcript = bodyText;
      entrySource = "whatsapp";
    } else {
      // Unsupported message type (image, sticker, location, etc.)
      await safeReply(from, HELP_MESSAGE);
      await finalizeClaim(messageId, userId, 0, []);
      return { outcome: "unsupported_type", entriesSaved: 0, userId };
    }

    // 8. Extract transactions from text
    const extracted = await extractTransactionsFromMessage(transcript);

    if (!extracted) {
      await safeReply(from, "Couldn't process that right now. Please try again.");
      await releaseClaim(messageId);
      return { outcome: "extraction_failed", entriesSaved: 0, userId };
    }

    if (extracted.entries.length === 0) {
      await safeReply(from, HELP_MESSAGE);
      await finalizeClaim(messageId, userId, 0, []);
      return { outcome: "no_entries", entriesSaved: 0, userId };
    }

    // 9. Amount cap
    const validEntries = extracted.entries.filter((e) => e.amount <= AMOUNT_CAP);
    const cappedCount = extracted.entries.length - validEntries.length;

    if (validEntries.length === 0) {
      await safeReply(
        from,
        "That amount looks too large. Please check and send again."
      );
      await finalizeClaim(messageId, userId, 0, []);
      return { outcome: "all_capped", entriesSaved: 0, userId };
    }

    // 10. Save entries idempotently
    const { savedCount, summaryLines } = await saveEntries({
      userId,
      messageId,
      entries: validEntries,
      source: entrySource,
    });

    // Build reply
    let replyText: string;
    if (savedCount === 1 && extracted.skipped === 0 && cappedCount === 0 && !extracted.truncated) {
      const sign = validEntries[0].type === "income" ? "+" : "-";
      replyText = `✅ Added: ${validEntries[0].category} — ${sign}Rs. ${formatRs(validEntries[0].amount)}`;
    } else {
      const bullets = summaryLines.map((l) => `• ${l}`).join("\n");
      replyText = `✅ Added ${savedCount} entries:\n${bullets}`;

      if (extracted.truncated) {
        replyText += "\n(Only the first 5 were saved.)";
      }

      if (extracted.skipped > 0 || cappedCount > 0) {
        const skippedTotal = extracted.skipped + cappedCount;
        replyText += `\n(${skippedTotal} skipped — couldn't read the amount.)`;
      }
    }

    // Budget threshold alerts (expenses only, non-blocking)
    const savedExpenses = validEntries
      .slice(0, savedCount)
      .filter((e) => e.type === "expense");

    if (savedExpenses.length > 0) {
      try {
        const currentPkMonth = getPkMonth();
        const effectiveBudgets = await getEffectiveBudgets(userId, currentPkMonth);

        if (Object.keys(effectiveBudgets).length > 0) {
          const userObjId = new mongoose.Types.ObjectId(userId);

          const categoryAgg = await Expense.aggregate([
            { $match: { userId: userObjId, month: currentPkMonth } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
          ]);

          const currentSpendByCat: Record<string, number> = {};
          let currentTotalSpend = 0;
          for (const row of categoryAgg) {
            currentSpendByCat[row._id] = row.total;
            currentTotalSpend += row.total;
          }

          const addedByCat: Record<string, number> = {};
          let addedTotal = 0;
          for (const exp of savedExpenses) {
            addedByCat[exp.category] = (addedByCat[exp.category] || 0) + exp.amount;
            addedTotal += exp.amount;
          }

          const alertLines: string[] = [];

          // Check categories touched in this message
          for (const cat of Object.keys(addedByCat)) {
            const budget = effectiveBudgets[cat];
            if (budget && budget > 0) {
              const after = currentSpendByCat[cat] || 0;
              const before = after - addedByCat[cat];
              const crossing = crossedThresholds(before, after, budget);

              if (crossing === "over") {
                alertLines.push(
                  `🚫 ${cat} budget exceeded (Rs. ${formatRs(after)} of Rs. ${formatRs(budget)})`
                );
              } else if (crossing === "warn") {
                const percent = Math.round((after / budget) * 100);
                alertLines.push(
                  `⚠️ ${cat} budget: ${percent}% used (Rs. ${formatRs(after)} of Rs. ${formatRs(budget)})`
                );
              }
            }
          }

          // Check Total budget if it exists
          const totalBudget = effectiveBudgets[BUDGET_TOTAL];
          if (totalBudget && totalBudget > 0) {
            const after = currentTotalSpend;
            const before = after - addedTotal;
            const crossing = crossedThresholds(before, after, totalBudget);

            if (crossing === "over") {
              alertLines.push(
                `🚫 Monthly budget exceeded (Rs. ${formatRs(after)} of Rs. ${formatRs(totalBudget)})`
              );
            } else if (crossing === "warn") {
              const percent = Math.round((after / totalBudget) * 100);
              alertLines.push(
                `⚠️ Monthly budget: ${percent}% used (Rs. ${formatRs(after)} of Rs. ${formatRs(totalBudget)})`
              );
            }
          }

          if (alertLines.length > 0) {
            replyText += "\n" + alertLines.slice(0, 2).join("\n");
          }
        }
      } catch (budgetErr) {
        console.error(
          "WhatsApp budget alert error:",
          budgetErr instanceof Error ? budgetErr.message : "Unknown error"
        );
      }
    }

    await safeReply(from, replyText);
    await finalizeClaim(messageId, userId, savedCount, summaryLines);

    return { outcome: "saved", entriesSaved: savedCount, userId };
  } catch (err) {
    // Release claim so a retry can re-process
    try {
      await releaseClaim(messageId);
    } catch {
      // Best-effort release
    }
    throw err;
  }
}

// ─── GET: Webhook verification ──────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    verifyToken === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ─── POST: Webhook handler ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody) as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: IncomingMessage[];
            statuses?: unknown[];
          };
        }>;
      }>;
    };

    await connectToDatabase();

    // Iterate ALL messages across all entries and changes
    const entries = body.entry ?? [];
    for (const entry of entries) {
      const changes = entry.changes ?? [];
      for (const change of changes) {
        const value = change.value;
        if (!value?.messages?.length) {
          continue;
        }

        for (const message of value.messages) {
          const startMs = Date.now();
          try {
            const result = await handleMessage(message);
            // Structured log — no message bodies, transcripts, phone numbers, or tokens
            console.log(
              JSON.stringify({
                messageId: message.id,
                userId: result.userId,
                type: message.type,
                outcome: result.outcome,
                entriesSaved: result.entriesSaved,
                ms: Date.now() - startMs,
              })
            );
          } catch (err) {
            console.error(
              JSON.stringify({
                messageId: message.id,
                type: message.type,
                outcome: "error",
                error: err instanceof Error ? err.message : "Unknown error",
                ms: Date.now() - startMs,
              })
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("WhatsApp webhook body parse error:", err instanceof Error ? err.message : "Unknown error");
  }

  return new NextResponse("OK", { status: 200 });
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
