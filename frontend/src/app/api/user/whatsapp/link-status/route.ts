import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import User from "@/models/User";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);

  await connectToDatabase();

  const user = await User.findById(new mongoose.Types.ObjectId(userId))
    .select("whatsappVerified whatsappNumber")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return success({
    whatsappVerified: user.whatsappVerified === true,
    whatsappNumber: user.whatsappNumber || null,
  });
});
