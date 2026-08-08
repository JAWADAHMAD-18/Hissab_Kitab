import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import User from "@/models/User";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  const body = await req.json();
  const { code } = body;

  if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    throw new AppError("A valid 6-digit code is required", 400);
  }

  await connectToDatabase();

  const user = await User.findById(new mongoose.Types.ObjectId(userId)).select(
    "+whatsappVerificationCode +whatsappVerificationExpiry"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.whatsappVerificationCode || !user.whatsappVerificationExpiry) {
    throw new AppError("No verification code pending. Please request a new code.", 400);
  }

  if (new Date() > user.whatsappVerificationExpiry) {
    user.whatsappVerificationCode = undefined;
    user.whatsappVerificationExpiry = undefined;
    await user.save();
    throw new AppError("Verification code has expired. Please request a new code.", 400);
  }

  if (user.whatsappVerificationCode !== code.trim()) {
    throw new AppError("Invalid verification code. Please try again.", 400);
  }

  if (!user.whatsappNumber) {
    throw new AppError("No phone number on file. Please request a new code.", 400);
  }

  user.whatsappVerified = true;
  user.whatsappVerificationCode = undefined;
  user.whatsappVerificationExpiry = undefined;
  await user.save();

  return success({
    whatsappNumber: user.whatsappNumber,
    whatsappVerified: true,
  });
});
