import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/AppError";
import { failure } from "@/lib/apiResponse";

type RouteHandler<T = any> = (
  req: NextRequest,
  context?: T
) => Promise<NextResponse>;

export function withErrorHandler<T = any>(
  handler: RouteHandler<T>
): RouteHandler<T> {
  return async (req: NextRequest, context?: T) => {
    try {
      return await handler(req, context);
    } catch (err: any) {
      if (err instanceof AppError) {
        return failure(err.message, err.statusCode);
      }

      console.error("Unhandled API Error:", err);
      return failure("Something went wrong", 500);
    }
  };
}
