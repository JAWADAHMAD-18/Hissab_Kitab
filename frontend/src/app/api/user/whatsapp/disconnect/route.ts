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

  await connectToDatabase();

  const user = await User.findById(new mongoose.Types.ObjectId(userId)).select(
    "+whatsappVerificationCode +whatsappVerificationExpiry"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.whatsappNumber = undefined;
  user.whatsappVerified = false;
  user.whatsappVerificationCode = undefined;
  user.whatsappVerificationExpiry = undefined;
  await user.save();

  return success({ message: "WhatsApp disconnected" });
});
