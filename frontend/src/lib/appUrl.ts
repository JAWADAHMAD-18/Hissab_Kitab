export function getAppBaseUrl(): string {
  const url =
    process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
