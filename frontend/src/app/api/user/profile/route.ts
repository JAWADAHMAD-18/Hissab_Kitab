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
    if (avatarUrl === null || avatarUrl === "") {
      user.image = undefined;
    } else if (typeof avatarUrl === "string") {
      const trimmed = avatarUrl.trim();
      if (/^https:\/\//i.test(trimmed)) {
        try {
          new URL(trimmed);
          user.image = trimmed;
        } catch {
          throw new AppError("Invalid avatar URL", 400);
        }
      } else {
        const match = trimmed.match(
          /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/
        );
        if (!match) {
          throw new AppError(
            "Invalid avatar format. Only PNG, JPEG, or WebP images are supported.",
            400
          );
        }
        const buffer = Buffer.from(match[2], "base64");
        if (buffer.length > 300 * 1024) {
          throw new AppError("Avatar image must be 300 KB or smaller", 400);
        }
        user.image = trimmed;
      }
    } else {
      throw new AppError("Invalid avatar format", 400);
    }
  }

  await user.save();

  return success({
    id: String(user._id),
    name: user.name,
    email: user.email,
    image: user.image || null,
  });
});
