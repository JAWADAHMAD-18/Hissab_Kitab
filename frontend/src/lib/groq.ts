import Groq, { toFile } from "groq-sdk";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "@/types";

// Verified active via GET https://api.groq.com/openai/v1/models (Aug 2026).
const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";
const GROQ_WHISPER_MODEL = "whisper-large-v3-turbo";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

function stripJsonFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export interface VoiceExpenseExtracted {
  amount: number | null;
  category: ExpenseCategory;
  note: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string | null> {
  const buffer = Buffer.from(await audioBlob.arrayBuffer());
  const file = await toFile(buffer, "recording.webm", {
    type: audioBlob.type || "audio/webm",
  });

  const transcription = await getGroqClient().audio.transcriptions.create({
    model: GROQ_WHISPER_MODEL,
    file,
    language: "ur",
    temperature: 0,
  });

  const text = transcription.text?.trim() ?? "";
  if (!text || text.length < 2) {
    return null;
  }

  return text;
}

const VOICE_EXPENSE_SYSTEM_PROMPT = [
  "You extract expense details from spoken voice notes for Hisab Kitab, a personal finance app for Pakistani users.",
  "The user may speak in Urdu, Roman Urdu (Urdu written in English letters), English, or a mix of all three — this is normal for Pakistani users.",
  "Understand common local expense vocabulary regardless of script or language, for example:",
  "roti/khana/lunch/dinner/nashta → Food;",
  "petrol/diesel/kiraya/rickshaw/bus/uber → Transport;",
  "bijli ka bill/gas bill/pani ka bill → Utilities;",
  "dawa/hospital/doctor/clinic → Health;",
  "ghar ka kiraya → Rent.",
  "Extract the amount regardless of whether it is spoken as digits or words, in Urdu or English (e.g. 'ek hazar' = 1000, 'sau' = 100, 'dhai sou' = 250, 'char sau pachaas' = 450).",
  "Respond with ONLY valid JSON — no markdown fences, no preamble, no trailing text.",
  'Shape: { "amount": number | null, "category": "...", "note": "..." }',
  `category MUST be exactly one of: ${EXPENSE_CATEGORIES.join(", ")}. Default to "Other" if genuinely unclear — never invent a new category.`,
  "amount: the rupee amount as a number only. Return null if no clear number is mentioned — do not guess.",
  "note: a short note for the user's own reference — may stay in whatever language or script they spoke (Urdu script, Roman Urdu, or English).",
].join(" ");

export async function extractExpenseFromVoice(
  transcript: string
): Promise<VoiceExpenseExtracted | null> {
  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: VOICE_EXPENSE_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: transcript,
      },
    ],
    temperature: 0.2,
    max_tokens: 150,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";

  try {
    const parsed = JSON.parse(stripJsonFences(raw)) as {
      amount?: unknown;
      category?: unknown;
      note?: unknown;
    };

    const amount =
      typeof parsed.amount === "number" && parsed.amount > 0 ? parsed.amount : null;

    let category =
      typeof parsed.category === "string" ? parsed.category.trim() : "Other";
    if (!EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
      category = "Other";
    }

    const note =
      typeof parsed.note === "string" && parsed.note.trim()
        ? parsed.note.trim()
        : transcript;

    return {
      amount,
      category: category as ExpenseCategory,
      note,
    };
  } catch {
    return null;
  }
}

export interface MonthlyNarrativeInput {
  userName: string;
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  topCategory: string;
  topCategoryAmount: number;
  expenseChangePercent: number | null;
}

export interface MonthlyNarrativeResult {
  overview: string;
  tips: string[];
}

export async function generateMonthlyNarrative(
  input: MonthlyNarrativeInput
): Promise<MonthlyNarrativeResult> {
  const {
    userName,
    monthLabel,
    totalIncome,
    totalExpense,
    topCategory,
    topCategoryAmount,
    expenseChangePercent,
  } = input;

  const firstName = userName.split(" ")[0] || userName;
  const net = totalIncome - totalExpense;

  const comparisonLine =
    expenseChangePercent === null
      ? "No spending data from the previous month to compare against."
      : expenseChangePercent === 0
        ? "Your total spending was exactly the same as last month."
        : expenseChangePercent > 0
          ? `Your total spending was up ${expenseChangePercent}% compared to last month.`
          : `Your total spending was down ${Math.abs(expenseChangePercent)}% compared to last month.`;

  const userPrompt = [
    `Month: ${monthLabel}`,
    `Total income: Rs. ${totalIncome.toLocaleString("en-IN")}`,
    `Total expenses: Rs. ${totalExpense.toLocaleString("en-IN")}`,
    `Net (income minus expenses): Rs. ${net.toLocaleString("en-IN")}`,
    `Top spending category: ${topCategory} (Rs. ${topCategoryAmount.toLocaleString("en-IN")})`,
    comparisonLine,
  ].join("\n");

  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: [
          "You are a warm, practical personal finance coach writing a month-end email for Hisab Kitab — a tracker for people living on one paycheck.",
          "Respond with ONLY valid JSON — no markdown fences, no preamble, no trailing text.",
          'The JSON shape MUST be: { "overview": "...", "tips": ["..."] }',
          "overview: 1–2 warm sentences, general praise/summary tone. Do NOT restate exact numbers — those are shown separately in the email.",
          "tips: 1–2 short, specific, actionable suggestions tied to the actual spending pattern (e.g. the top category). Each tip should be phrase-length, not a full paragraph. If only one clear insight exists, return just one tip — do not pad.",
          "You may use light Hinglish if it feels natural.",
        ].join(" "),
      },
      {
        role: "user",
        content: `Write the month-end summary JSON for ${firstName}.\n\n${userPrompt}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 250,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";

  // Strip markdown code fences if the model wraps the JSON despite instructions
  const cleaned = stripJsonFences(raw);

  try {
    const parsed = JSON.parse(cleaned);
    const overview =
      typeof parsed.overview === "string" && parsed.overview.trim()
        ? parsed.overview.trim()
        : raw || "Here's your monthly summary.";
    const tips: string[] = Array.isArray(parsed.tips)
      ? parsed.tips
          .filter((t: unknown) => typeof t === "string" && (t as string).trim())
          .map((t: string) => t.trim())
      : [];
    return { overview, tips };
  } catch {
    // Graceful fallback — use the raw text as overview, no tips
    return {
      overview: raw || "Here's your monthly summary.",
      tips: [],
    };
  }
}
