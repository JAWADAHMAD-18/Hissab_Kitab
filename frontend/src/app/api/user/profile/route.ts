import { NextRequest } from "next/server";
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
  const { name, avatarUrl } = body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new AppError("Name cannot be empty", 400);
    }
    user.name = name.trim();
  }

  if (avatarUrl !== undefined) {
    user.image = avatarUrl;
  }

  await user.save();

  return success({
    id: String(user._id),
    name: user.name,
    email: user.email,
    image: user.image || null,
  });
});
