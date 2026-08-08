import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import User from "@/models/User";
import {
  generateVerificationCode,
  isValidE164,
  sendTextMessage,
} from "@/lib/whatsapp";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  const body = await req.json();
  const { phoneNumber } = body;

  if (!phoneNumber || typeof phoneNumber !== "string") {
    throw new AppError("Phone number is required", 400);
  }

  const normalized = phoneNumber.trim();
  if (!isValidE164(normalized)) {
    throw new AppError(
      "Invalid phone number format. Use E.164 format, e.g. +923001234567",
      400
    );
  }

  const code = generateVerificationCode();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await connectToDatabase();

  const user = await User.findById(new mongoose.Types.ObjectId(userId)).select(
    "+whatsappVerificationCode +whatsappVerificationExpiry"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.whatsappNumber = normalized;
  user.whatsappVerified = false;
  user.whatsappVerificationCode = code;
  user.whatsappVerificationExpiry = expiry;
  await user.save();

  await sendTextMessage(
    normalized,
    `Your Hisab Kitab verification code is: ${code}`
  );

  return success({ message: "Verification code sent" });
});
