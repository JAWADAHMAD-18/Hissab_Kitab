import { AppError } from "@/lib/AppError";

function getAccessToken(): string {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new AppError("WhatsApp is not configured", 500);
  }
  return accessToken;
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function sendTextMessage(to: string, body: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = getAccessToken();

  if (!phoneNumberId) {
    throw new AppError("WhatsApp is not configured", 500);
  }

  const toDigits = normalizePhoneNumber(to);

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toDigits,
        type: "text",
        text: { body },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("WhatsApp API error:", response.status, errorBody);
    throw new AppError("Failed to send WhatsApp message", 502);
  }
}

export async function getMediaUrl(mediaId: string): Promise<string> {
  const response = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("WhatsApp media metadata error:", response.status, errorBody);
    throw new AppError("Failed to get media URL", 502);
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new AppError("Media URL not found in response", 502);
  }

  return data.url;
}

export async function downloadMedia(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("WhatsApp media download error:", response.status, errorBody);
    throw new AppError("Failed to download media", 502);
  }

  return Buffer.from(await response.arrayBuffer());
}

/** Basic E.164 check, e.g. +923001234567 */
export function isValidE164(phoneNumber: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phoneNumber);
}

export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
