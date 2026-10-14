import Groq, { NotFoundError, BadRequestError } from "groq-sdk";
import type {
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsNonStreaming,
} from "groq-sdk/resources/chat/completions";
import { CHAT_MODEL, CHAT_FALLBACK_MODEL } from "@/lib/groqModels";

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

export interface GroqChatOptions {
  messages: Array<ChatCompletionMessageParam>;
  temperature?: number;
  maxCompletionTokens?: number;
  jsonFormat?: boolean;
  timeoutMs?: number;
}

async function executeChatAttempt(
  client: Groq,
  model: string,
  messages: Array<ChatCompletionMessageParam>,
  temperature: number,
  maxCompletionTokens: number,
  jsonFormat: boolean,
  timeoutMs: number
) {
  const isGptOss = model.toLowerCase().includes("gpt-oss");

  // groq-sdk ^1.5.0 supports reasoning_effort and max_completion_tokens for OpenAI / reasoning models
  const body: ChatCompletionCreateParamsNonStreaming = {
    model,
    messages,
    temperature,
    max_completion_tokens: maxCompletionTokens,
    ...(isGptOss ? { reasoning_effort: "low" as const } : {}),
    ...(jsonFormat ? { response_format: { type: "json_object" as const } } : {}),
  };

  return await client.chat.completions.create(body, {
    timeout: timeoutMs,
    maxRetries: 1,
  });
}

async function callModelWithJsonFallback(
  client: Groq,
  model: string,
  messages: Array<ChatCompletionMessageParam>,
  temperature: number,
  maxTokens: number,
  jsonFormat: boolean,
  timeoutMs: number
) {
  try {
    return await executeChatAttempt(
      client,
      model,
      messages,
      temperature,
      maxTokens,
      jsonFormat,
      timeoutMs
    );
  } catch (err: unknown) {
    const is400 =
      err instanceof BadRequestError || (err as { status?: number })?.status === 400;

    // If response_format json_object is rejected (400), retry once dropping ONLY that param
    if (jsonFormat && is400) {
      return await executeChatAttempt(
        client,
        model,
        messages,
        temperature,
        maxTokens,
        false,
        timeoutMs
      );
    }
    throw err;
  }
}

export async function executeGroqChat(
  options: GroqChatOptions
): Promise<string | null> {
  const client = getGroqClient();
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxCompletionTokens ?? 1500;
  const jsonFormat = options.jsonFormat ?? false;
  const timeoutMs = options.timeoutMs ?? 12_000;

  let completion;
  let activeModel = CHAT_MODEL;

  try {
    completion = await callModelWithJsonFallback(
      client,
      activeModel,
      options.messages,
      temperature,
      maxTokens,
      jsonFormat,
      timeoutMs
    );
  } catch (err: unknown) {
    const isModelNotFound =
      err instanceof NotFoundError ||
      (err as { status?: number })?.status === 404 ||
      (err as { error?: { code?: string } })?.error?.code === "model_not_found" ||
      (typeof (err as Error)?.message === "string" &&
        /model_not_found|does not exist/i.test((err as Error).message));

    if (isModelNotFound) {
      console.error({ stage: "groq_model_missing", model: activeModel });
      if (activeModel !== CHAT_FALLBACK_MODEL) {
        activeModel = CHAT_FALLBACK_MODEL;
        try {
          completion = await callModelWithJsonFallback(
            client,
            activeModel,
            options.messages,
            temperature,
            maxTokens,
            jsonFormat,
            timeoutMs
          );
        } catch (fallbackErr: unknown) {
          const finalErr = fallbackErr as {
            status?: number;
            name?: string;
            message?: string;
          };
          console.error({
            stage: "groq_call",
            status: finalErr?.status,
            name: finalErr?.name,
            message: finalErr?.message,
          });
          return null;
        }
      } else {
        return null;
      }
    } else {
      const finalErr = err as {
        status?: number;
        name?: string;
        message?: string;
      };
      console.error({
        stage: "groq_call",
        status: finalErr?.status,
        name: finalErr?.name,
        message: finalErr?.message,
      });
      return null;
    }
  }

  const choice = completion.choices?.[0];
  const content = choice?.message?.content?.trim() ?? "";

  if (!content) {
    console.error({
      stage: "groq_empty",
      finish_reason: choice?.finish_reason,
      usage: completion.usage,
    });
    return null;
  }

  return content;
}
