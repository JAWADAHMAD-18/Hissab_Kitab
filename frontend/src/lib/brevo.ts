interface SendMonthlyReportEmailParams {
  toEmail: string;
  toName: string;
  monthLabel: string;
  overview: string;
  tips: string[];
  totalIncome: number;
  totalExpense: number;
}

function formatRs(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTipsHtml(tips: string[]): string {
  if (tips.length === 0) return "";

  const rows = tips
    .map(
      (tip) => `
              <tr>
                <td style="padding:0 0 8px 0;font-size:15px;line-height:1.5;color:#111827;">
                  <span style="color:#059669;font-size:16px;vertical-align:middle;">&#9679;&nbsp;</span>${escapeHtml(tip)}
                </td>
              </tr>`
    )
    .join("");

  return `
              <!-- Tips section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0 0 0;">
                <tr>
                  <td style="padding:0 0 10px 0;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">
                    Worth trying next month
                  </td>
                </tr>
                ${rows}
              </table>`;
}

function buildHtml(params: SendMonthlyReportEmailParams): string {
  const firstName = params.toName.split(" ")[0] || params.toName;
  const net = params.totalIncome - params.totalExpense;
  const netColor = net >= 0 ? "#059669" : "#DC2626";
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Outer card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;">
          <tr>
            <td style="padding:32px;">
              <!-- Header row: green dot + brand name -->
              <table cellpadding="0" cellspacing="0" style="padding:0 0 20px 0;">
                <tr>
                  <td style="vertical-align:middle;padding-right:8px;">
                    <div style="width:10px;height:10px;background:#059669;border-radius:50%;"></div>
                  </td>
                  <td style="vertical-align:middle;font-size:16px;font-weight:700;color:#111827;">
                    Hisab Kitab
                  </td>
                </tr>
              </table>

              <!-- Month label -->
              <p style="margin:0 0 4px 0;font-size:13px;color:#6B7280;">
                Your ${escapeHtml(params.monthLabel)} Summary
              </p>

              <!-- Greeting -->
              <p style="margin:0 0 20px 0;font-size:22px;font-weight:700;color:#111827;">
                Hi ${escapeHtml(firstName)},
              </p>

              <!-- Overview text -->
              <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#111827;">
                ${escapeHtml(params.overview)}
              </p>

              <!-- Hero stat callout -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                <tr>
                  <td style="background:rgba(5,150,105,0.08);border-radius:12px;padding:20px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">
                      You kept this month
                    </p>
                    <p style="margin:0;font-size:32px;font-weight:700;color:${netColor};">
                      ${formatRs(net)}
                    </p>
                  </td>
                </tr>
              </table>

              ${buildTipsHtml(params.tips)}

              <!-- Stats table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0 24px 0;">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6B7280;">Total Income</td>
                  <td style="padding:8px 0;font-size:14px;font-weight:700;color:#059669;text-align:right;">${formatRs(params.totalIncome)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6B7280;">Total Expenses</td>
                  <td style="padding:8px 0;font-size:14px;font-weight:700;color:#DC2626;text-align:right;">${formatRs(params.totalExpense)}</td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 24px 0;">
                    <a href="${appUrl}" target="_blank" style="display:inline-block;background:#059669;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">
                      View Full Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <p style="margin:0;text-align:center;font-size:12px;color:#9CA3AF;">
                Sent by Hisab Kitab
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendMonthlyReportEmail(
  params: SendMonthlyReportEmailParams
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Hisab Kitab";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo is not configured (BREVO_API_KEY, BREVO_SENDER_EMAIL)");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: params.toEmail, name: params.toName }],
      subject: `Your ${params.monthLabel} Summary — Hisab Kitab`,
      htmlContent: buildHtml(params),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Brevo API error:", response.status, errorBody);
    throw new Error("Failed to send email via Brevo");
  }
}
