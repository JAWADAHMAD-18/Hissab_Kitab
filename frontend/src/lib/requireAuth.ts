import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/AppError";

export class AuthError extends AppError {
  constructor(message = "Unauthorized access. Session invalid or missing.", statusCode = 401) {
    super(message, statusCode);
    this.name = "AuthError";
  }
}

/**
 * Shared helper to verify server-side authentication and get the authenticated user's ID.
 * Throws an AuthError (401) if not authenticated.
 * Supports both web sessions (via getServerSession) and mobile Bearer tokens (via getToken).
 */
export async function requireAuth(req?: Request | NextRequest): Promise<string> {
  // 1. Try NextAuth web session
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    return session.user.id;
  }

  // 2. Fallback: check JWT token from request header / Bearer auth (for mobile client)
  if (req) {
    const token = await getToken({
      req: req as unknown as Parameters<typeof getToken>[0]["req"],
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token?.id) {
      return token.id as string;
    }
  }

  throw new AuthError("Unauthorized access. Session invalid or missing.", 401);
}
