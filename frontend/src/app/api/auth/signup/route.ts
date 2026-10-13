import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { success } from "@/lib/apiResponse";
import { AppError } from "@/lib/AppError";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { validatePassword } from "@/lib/passwordPolicy";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { name, email, password } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new AppError("Name is required", 400);
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new AppError("Valid email is required", 400);
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new AppError(passwordError, 400);
  }

  await connectToDatabase();

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  return success(
    {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
    },
    201
  );
});
