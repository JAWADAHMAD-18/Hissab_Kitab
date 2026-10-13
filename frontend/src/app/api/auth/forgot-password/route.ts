import { NextRequest } from "next/server";
import { after } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/getClientIp";
import { getAppBaseUrl, sendPasswordResetEmail } from "@/lib/brevo";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { email } = body;

  if (
    !email ||
    typeof email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(email.trim())
  ) {
    throw new AppError("Valid email is required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. IP rate limit: 5 requests per hour (3600s)
  const clientIp = getClientIp(req);
  const ipLimit = await checkRateLimit({
    key: `forgot:ip:${clientIp}`,
    limit: 5,
    windowSeconds: 3600,
  });

  if (!ipLimit.allowed) {
    throw new AppError("Too many requests. Please try again later.", 429);
  }

  // 2. Email cooldown: 1 request per 60s
  const emailCooldown = await checkRateLimit({
    key: `forgot:email:${normalizedEmail}`,
    limit: 1,
    windowSeconds: 60,
  });

  if (!emailCooldown.allowed) {
    // Return identical generic response to prevent probing email timing/state
    return success({ sent: true });
  }

  await connectToDatabase();

  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete any prior reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Store hashed token with 15-minute expiry
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${getAppBaseUrl()}/reset-password?token=${rawToken}`;
    const isFirstTimeSetup = !user.password;
    const toEmail = user.email;
    const toName = user.name;

    // Send asynchronously in after() to balance timing with non-existing emails
    after(async () => {
      try {
        await sendPasswordResetEmail({
          toEmail,
          toName,
          resetUrl,
          isFirstTimeSetup,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Failed to send password reset email:", msg);
      }
    });
  }

  // Always return identical success payload
  return success({ sent: true });
});
