import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import User from "@/models/User";
import { withErrorHandler } from "@/lib/withErrorHandler";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const userId = await requireAuth(req);
  await connectToDatabase();

  const user = await User.findById(userId).select("image").lean();
  if (!user || !user.image) {
    return new NextResponse("Avatar not found", { status: 404 });
  }

  const rawImage = user.image.trim();

  // If https URL -> 302 redirect
  if (/^https:\/\//i.test(rawImage)) {
    return NextResponse.redirect(rawImage, 302);
  }

  // If data URL -> validate image/png|jpeg|webp only (never SVG)
  const dataUrlMatch = rawImage.match(
    /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/
  );

  if (!dataUrlMatch) {
    return new NextResponse("Invalid avatar format", { status: 404 });
  }

  const mimeSubtype = dataUrlMatch[1];
  const base64Data = dataUrlMatch[2];
  const buffer = Buffer.from(base64Data, "base64");

  // Strong ETag based on sha256 of image bytes
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const etag = `"${hash}"`;

  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === hash)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": `image/${mimeSubtype}`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-cache",
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
});
