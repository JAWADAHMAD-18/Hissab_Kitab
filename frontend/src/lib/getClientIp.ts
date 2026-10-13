import { NextRequest } from "next/server";

/**
 * Extracts the client IP from request headers.
 * Prefers first entry in x-forwarded-for, falling back to x-real-ip, then "unknown".
 */
export function getClientIp(req: Request | NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return "unknown";
}
