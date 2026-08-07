import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { transcribeAudio, extractExpenseFromVoice } from "@/lib/groq";

export const POST = withErrorHandler(async (req: NextRequest) => {
  await requireAuth(req);

  const formData = await req.formData();
  const audio = formData.get("audio");

  if (!audio || !(audio instanceof Blob) || audio.size === 0) {
    throw new AppError("Audio file is required", 400);
  }

  const transcript = await transcribeAudio(audio);

  if (!transcript) {
    return success({ transcript: null, extracted: null });
  }

  const extracted = await extractExpenseFromVoice(transcript);

  return success({ transcript, extracted });
});

export const dynamic = "force-dynamic";
export const maxDuration = 60;
