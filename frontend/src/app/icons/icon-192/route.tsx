import { iconResponse } from "../_iconResponse";

export const dynamic = "force-static";
export const contentType = "image/png";

export function GET() {
  return iconResponse(192);
}
