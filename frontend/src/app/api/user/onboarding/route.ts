import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import User from "@/models/User";
import { success } from "@/lib/apiResponse";
import { withErrorHandler } from "@/lib/withErrorHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  await connectToDatabase();

  const userObjId = new mongoose.Types.ObjectId(userId);

  // Idempotent set: only set if onboardingCompletedAt does not already exist
  await User.updateOne(
    { _id: userObjId, onboardingCompletedAt: { $exists: false } },
    { $set: { onboardingCompletedAt: new Date() } }
  );

  return success({ completed: true });
});
