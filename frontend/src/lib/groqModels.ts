export const CHAT_MODEL =
  process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b";

export const CHAT_FALLBACK_MODEL =
  process.env.GROQ_CHAT_FALLBACK_MODEL || "openai/gpt-oss-120b";

export const STT_MODEL =
  process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo";
