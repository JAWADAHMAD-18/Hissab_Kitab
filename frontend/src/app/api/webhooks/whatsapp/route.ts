import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Expense from "@/models/Expense";
import {
  downloadMedia,
  getMediaUrl,
  normalizePhoneNumber,
  sendTextMessage,
} from "@/lib/whatsapp";
import { transcribeAudio, extractExpenseFromVoice } from "@/lib/groq";

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
  const normalizedFrom = normalizePhoneNumber(from);

  const candidates = await User.find({
    whatsappVerified: true,
    whatsappNumber: { $exists: true, $ne: null },
  }).lean();

  return (
    candidates.find(
      (user) => normalizePhoneNumber(user.whatsappNumber || "") === normalizedFrom
    ) ?? null
  );
}

async function safeReply(to: string, body: string): Promise<void> {
  try {
    await sendTextMessage(to, body);
  } catch (err) {
    console.error("WhatsApp reply failed:", err);
  }
}

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

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Process synchronously before ack — Groq calls finish within Meta's timeout.
  // If this ever becomes noticeably slow, revisit with an async/background-job pattern.
  try {
    const body = JSON.parse(rawBody) as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: Array<{
              from: string;
              type: string;
              audio?: { id: string; mime_type?: string };
            }>;
            statuses?: unknown[];
          };
        }>;
      }>;
    };

    const value = body.entry?.[0]?.changes?.[0]?.value;
    if (!value?.messages?.length) {
      return new NextResponse("OK", { status: 200 });
    }

    const message = value.messages[0];
    const from = message.from;
    const type = message.type;

    await connectToDatabase();

    const user = await findVerifiedUserByPhone(from);
    if (!user) {
      await safeReply(
        from,
        "This number isn't linked to a Hisab Kitab account yet. Connect it in Settings first."
      );
      return new NextResponse("OK", { status: 200 });
    }

    if (type !== "audio") {
      await safeReply(
        from,
        "Send a voice note to log an expense — e.g. 'lunch, 450 rupees'"
      );
      return new NextResponse("OK", { status: 200 });
    }

    const mediaId = message.audio?.id;
    if (!mediaId) {
      await safeReply(
        from,
        "Couldn't quite catch that — try recording again?"
      );
      return new NextResponse("OK", { status: 200 });
    }

    const mediaUrl = await getMediaUrl(mediaId);
    const audioBuffer = await downloadMedia(mediaUrl);
    const mimeType = message.audio?.mime_type || "audio/ogg";
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });

    const transcript = await transcribeAudio(audioBlob);
    if (!transcript) {
      await safeReply(
        from,
        "Couldn't quite catch that — try recording again?"
      );
      return new NextResponse("OK", { status: 200 });
    }

    const extracted = await extractExpenseFromVoice(transcript);

    if (!extracted || extracted.amount == null) {
      await safeReply(
        from,
        "Got it, but couldn't catch the amount clearly — try again with the amount stated clearly?"
      );
      return new NextResponse("OK", { status: 200 });
    }

    const now = new Date();
    await Expense.create({
      userId: user._id,
      amount: extracted.amount,
      category: extracted.category,
      note: extracted.note || transcript,
      date: now,
      month: now.toISOString().slice(0, 7),
      source: "voice",
    });

    await safeReply(
      from,
      `✅ Added: ${extracted.category} — Rs. ${formatRs(extracted.amount)}`
    );
  } catch (err) {
    console.error("WhatsApp webhook processing error:", err);
  }

  return new NextResponse("OK", { status: 200 });
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
