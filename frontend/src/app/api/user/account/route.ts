import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import WhatsAppMessage from "@/models/WhatsAppMessage";
import PasswordResetToken from "@/models/PasswordResetToken";
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

  // Delete all user-scoped children records in parallel, then user document
  await Promise.all([
    Income.deleteMany({ userId: userObjId }),
    Expense.deleteMany({ userId: userObjId }),
    Budget.deleteMany({ userId: userObjId }),
    WhatsAppMessage.deleteMany({ userId: userObjId }),
    PasswordResetToken.deleteMany({ userId: userObjId }),
  ]);

  await User.deleteOne({ _id: userObjId });

  return success({ deleted: true });
});
