import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import User from "@/models/User";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  await connectToDatabase();

  const body = await req.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Current and new password are required", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Google-only accounts have no stored password
  if (!user.password) {
    throw new AppError(
      "This account doesn't use a password. Sign in via Google instead.",
      400
    );
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return success({ updated: true });
});
