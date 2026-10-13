import { connectToDatabase } from "@/lib/db";
import RateLimit from "@/models/RateLimit";

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Checks a rate limit key against an atomic fixed-window counter stored in MongoDB.
 * Never relies solely on MongoDB TTL background cleanup; always checks expiresAt in queries.
 */
export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<RateLimitResult> {
  await connectToDatabase();
  const now = new Date();

  // 1. Try to increment within an active window
  const active = await RateLimit.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true }
  );

  if (active) {
    const allowed = active.count <= limit;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((active.expiresAt.getTime() - Date.now()) / 1000)
    );
    return { allowed, retryAfterSeconds };
  }

  // 2. No active window found. Either an expired document exists or no document exists.
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  // If an expired document exists, overwrite it with a fresh window
  const replaced = await RateLimit.findOneAndUpdate(
    { key, expiresAt: { $lte: now } },
    { $set: { count: 1, expiresAt } },
    { new: true }
  );

  if (replaced) {
    const allowed = replaced.count <= limit;
    return { allowed, retryAfterSeconds: windowSeconds };
  }

  // 3. No document existed at all. Create a new window document.
  try {
    const created = await RateLimit.create({
      key,
      count: 1,
      expiresAt,
    });
    const allowed = created.count <= limit;
    return { allowed, retryAfterSeconds: windowSeconds };
  } catch (err: unknown) {
    // Handle race condition on duplicate key (E11000)
    const mongoErr = err as { code?: number };
    if (mongoErr?.code === 11000) {
      // Another request created or updated the window concurrently; retry increment once
      const retry = await RateLimit.findOneAndUpdate(
        { key, expiresAt: { $gt: new Date() } },
        { $inc: { count: 1 } },
        { new: true }
      );

      if (retry) {
        const allowed = retry.count <= limit;
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((retry.expiresAt.getTime() - Date.now()) / 1000)
        );
        return { allowed, retryAfterSeconds };
      }
    }
    throw err;
  }
}
