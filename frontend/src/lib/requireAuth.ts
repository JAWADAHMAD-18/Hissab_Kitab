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
  console.log('[DEBUG requireAuth] NEXTAUTH_SECRET set:', !!process.env.NEXTAUTH_SECRET, 'length:', process.env.NEXTAUTH_SECRET?.length);

  let session = null;
  try {
    session = await getServerSession(authOptions);
    console.log('[DEBUG requireAuth] session result:', session ? 'session found, user id: ' + session.user?.id : 'session is null/undefined');
  } catch (error) {
    console.log('[DEBUG requireAuth] error caught:', error);
  }

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
