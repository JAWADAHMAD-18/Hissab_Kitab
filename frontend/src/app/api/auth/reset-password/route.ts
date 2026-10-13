import { NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/getClientIp";
import { validatePassword } from "@/lib/passwordPolicy";

const HEX_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

// Shared IP rate-limit check: 20 attempts per 15 minutes (900s)
async function enforceResetIpLimit(req: NextRequest): Promise<void> {
  const clientIp = getClientIp(req);
  const result = await checkRateLimit({
    key: `reset:ip:${clientIp}`,
    limit: 20,
    windowSeconds: 900,
  });

  if (!result.allowed) {
    throw new AppError("Too many requests. Please try again later.", 429);
  }
}

/**
 * GET: Verify token validity without consuming it.
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  await enforceResetIpLimit(req);

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token || !HEX_TOKEN_REGEX.test(token)) {
    return success({ valid: false });
  }

  await connectToDatabase();

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const doc = await PasswordResetToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  return success({ valid: Boolean(doc) });
});

/**
 * POST: Atomically consume token and update password.
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  await enforceResetIpLimit(req);

  const body = await req.json().catch(() => ({}));
  const { token, password } = body;

  if (!token || typeof token !== "string" || !HEX_TOKEN_REGEX.test(token)) {
    throw new AppError(
      "This reset link is invalid or has expired. Please request a new one.",
      400
    );
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new AppError(passwordError, 400);
  }

  await connectToDatabase();

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Atomically consume the token doc
  const tokenDoc = await PasswordResetToken.findOneAndDelete({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    throw new AppError(
      "This reset link is invalid or has expired. Please request a new one.",
      400
    );
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw new AppError(
      "This reset link is invalid or has expired. Please request a new one.",
      400
    );
  }

  // Update password with 10 salt rounds
  user.password = await bcrypt.hash(password, 10);
  await user.save();

  // Invalidate any remaining tokens for this user
  await PasswordResetToken.deleteMany({ userId: user._id });

  return success({ reset: true });
});
