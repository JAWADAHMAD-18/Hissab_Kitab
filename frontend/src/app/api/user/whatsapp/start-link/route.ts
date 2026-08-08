import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import User from "@/models/User";
import { generateVerificationCode } from "@/lib/whatsapp";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);

  const code = generateVerificationCode();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await connectToDatabase();

  const user = await User.findById(new mongoose.Types.ObjectId(userId)).select(
    "+whatsappVerificationCode +whatsappVerificationExpiry"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.whatsappVerificationCode = code;
  user.whatsappVerificationExpiry = expiry;
  await user.save();

  return success({ code });
});
