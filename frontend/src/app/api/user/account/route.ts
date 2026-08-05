import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import User from "@/models/User";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  await connectToDatabase();

  const userObjId = new mongoose.Types.ObjectId(userId);

  const user = await User.findById(userObjId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Delete children first, then parent
  await Income.deleteMany({ userId: userObjId });
  await Expense.deleteMany({ userId: userObjId });
  await User.deleteOne({ _id: userObjId });

  return success({ deleted: true });
});
