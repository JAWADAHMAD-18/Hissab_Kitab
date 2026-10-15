interface SendMonthlyReportEmailParams {
  toEmail: string;
  toName: string;
  monthLabel: string;
  overview: string;
  tips: string[];
  totalIncome: number;
  totalExpense: number;
}

export interface WeeklyBudgetAlert {
  label: string;
  percent: number;
  level: "warn" | "over";
  spent: number;
  budget: number;
}

export interface SendWeeklyReportEmailParams {
  toEmail: string;
  toName: string;
  weekLabel: string;
  narrative: string;
  totalIncome: number;
  totalExpense: number;
  budgetAlerts?: WeeklyBudgetAlert[];
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
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6B7280;">Income</td>
                  <td style="padding:8px 0;font-size:14px;font-weight:700;color:#059669;text-align:right;">${formatRs(params.totalIncome)}</td>
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

function buildBudgetCheckHtml(alerts?: WeeklyBudgetAlert[]): string {
  if (!alerts || alerts.length === 0) return "";

  const displayAlerts = alerts.slice(0, 5);
  const rows = displayAlerts
    .map((alert) => {
      const color = alert.level === "over" ? "#DC2626" : "#F59E0B";
      const text =
        alert.level === "over"
          ? `${escapeHtml(alert.label)} — over budget by ${formatRs(alert.spent - alert.budget)}`
          : `${escapeHtml(alert.label)} — ${alert.percent}% of ${formatRs(alert.budget)} used`;

      return `
              <tr>
                <td style="padding:0 0 6px 0;font-size:14px;line-height:1.5;color:${color};font-weight:600;">
                  <span style="font-size:14px;vertical-align:middle;">&#9679;&nbsp;</span>${text}
                </td>
              </tr>`;
    })
    .join("");

  return `
              <!-- Budget check section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 0 20px 0;">
                <tr>
                  <td style="padding:0 0 8px 0;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">
                    Budget check
                  </td>
                </tr>
                ${rows}
              </table>`;
}

function buildWeeklyHtml(params: SendWeeklyReportEmailParams): string {
  const firstName = params.toName.split(" ")[0] || params.toName;
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

              <!-- Heading -->
              <p style="margin:0 0 20px 0;font-size:22px;font-weight:700;color:#111827;">
                Your Week of ${escapeHtml(params.weekLabel)}
              </p>

              <!-- Narrative/Brief -->
              <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#111827;">
                Hi ${escapeHtml(firstName)},<br><br>
                ${escapeHtml(params.narrative)}
              </p>

              ${buildBudgetCheckHtml(params.budgetAlerts)}

              <!-- Stats table: compact 2-row table (Total In / Total Out for the week) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0 24px 0;border-top:1px solid #E5E7EB;">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6B7280;">Total In</td>
                  <td style="padding:8px 0;font-size:14px;font-weight:700;color:#059669;text-align:right;">${formatRs(params.totalIncome)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6B7280;">Total Out</td>
                  <td style="padding:8px 0;font-size:14px;font-weight:700;color:#DC2626;text-align:right;">${formatRs(params.totalExpense)}</td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 24px 0;">
                    <a href="${appUrl}" target="_blank" style="display:inline-block;background:#059669;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">
                      View Dashboard &rarr;
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

export async function sendWeeklyReportEmail(
  params: SendWeeklyReportEmailParams
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
      subject: "Your Week in Review — Hisab Kitab",
      htmlContent: buildWeeklyHtml(params),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Brevo API error:", response.status, errorBody);
    throw new Error("Failed to send email via Brevo");
  }
}

export function getAppBaseUrl(): string {
  const url =
    process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

export interface SendTransactionalEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  html: string;
}

export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Hisab Kitab";

  if (!apiKey || !senderEmail) {
    throw new Error(
      "Brevo is not configured (BREVO_API_KEY, BREVO_SENDER_EMAIL)"
    );
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
      subject: params.subject,
      htmlContent: params.html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Brevo API error:", response.status, errorBody);
    throw new Error(`Failed to send email via Brevo (status: ${response.status})`);
  }
}

export interface SendPasswordResetEmailParams {
  toEmail: string;
  toName: string;
  resetUrl: string;
  isFirstTimeSetup: boolean;
}

export async function sendPasswordResetEmail(
  params: SendPasswordResetEmailParams
): Promise<void> {
  const subject = params.isFirstTimeSetup
    ? "Set your Hisab Kitab password"
    : "Reset your Hisab Kitab password";

  const firstName = params.toName.split(" ")[0] || params.toName;
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(params.resetUrl);

  const headline = params.isFirstTimeSetup
    ? "Set your Hisab Kitab password"
    : "Reset your Hisab Kitab password";

  const introText = params.isFirstTimeSetup
    ? "You requested to set a password for your Hisab Kitab account."
    : "We received a request to reset your Hisab Kitab password.";

  const googleNote = params.isFirstTimeSetup
    ? `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#4B5563;">
        You signed up with Google, so you don&apos;t have a password yet. Setting one lets you sign in with email too. Google sign-in will keep working.
      </p>`
    : "";

  const buttonText = params.isFirstTimeSetup
    ? "Set Password"
    : "Reset Password";

  const html = `<!DOCTYPE html>
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

              <!-- Heading -->
              <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;">
                ${escapeHtml(headline)}
              </p>

              <!-- Greeting & Intro -->
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#111827;">
                Hi ${safeName},<br><br>
                ${escapeHtml(introText)}
              </p>

              ${googleNote}

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${safeUrl}" target="_blank" style="display:inline-block;background:#059669;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
                      ${escapeHtml(buttonText)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback plain link -->
              <p style="margin:0 0 24px 0;font-size:12px;line-height:1.5;color:#6B7280;word-break:break-all;text-align:center;">
                Or copy and paste this URL into your browser:<br>
                <a href="${safeUrl}" target="_blank" style="color:#059669;text-decoration:underline;">${safeUrl}</a>
              </p>

              <!-- Expiry & Security notes -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 0 0 0;border-top:1px solid #E5E7EB;">
                <tr>
                  <td style="font-size:13px;line-height:1.5;color:#6B7280;">
                    <p style="margin:0 0 8px 0;">This link expires in 15 minutes and can be used once.</p>
                    <p style="margin:0;">If you didn&apos;t request this, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <p style="margin:24px 0 0 0;text-align:center;font-size:12px;color:#9CA3AF;">
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

  await sendTransactionalEmail({
    toEmail: params.toEmail,
    toName: params.toName,
    subject,
    html,
  });
}

