// Shared sender for transactional email via the Resend connector gateway.
// RESEND_API_KEY is injected by the linked Resend connection; LOVABLE_API_KEY is
import { DEFAULT_FROM_EMAIL } from "./config.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export interface SendEmailResult {
  sent: boolean;
  error?: string;
}

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<SendEmailResult> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!lovableKey || !resendKey) {
    return { sent: false, error: "Email is not configured" };
  }

  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: params.from ?? DEFAULT_FROM_EMAIL,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Resend send failed [${res.status}]: ${body}`);
    return { sent: false, error: `${res.status}: ${body}` };
  }
  return { sent: true };
}

export function betaAccessEmailHtml(params: {
  code: string;
  name?: string;
  appUrl: string;
  expiresAt: string;
}): string {
  const { code, name, appUrl, expiresAt } = params;
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0b0d12;font-family:Arial,Helvetica,sans-serif;color:#e7eaf0;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <h1 style="font-size:22px;margin:0 0 16px;color:#ffffff;">You're in, ${name ? escapeHtml(name) : "there"}.</h1>
    <p style="font-size:15px;line-height:1.6;color:#b9c0cc;margin:0 0 24px;">
      Your RaidFi beta access has been approved. Use this access code to sign up:
    </p>
    <div style="background:#131722;border:1px solid #232a38;border-radius:10px;padding:20px;text-align:center;margin:0 0 24px;">
      <span style="font-size:28px;letter-spacing:6px;font-weight:bold;color:#ffffff;">${code}</span>
    </div>
    <p style="font-size:14px;color:#b9c0cc;margin:0 0 24px;">
      The code is valid until <strong style="color:#ffffff;">${expiresAt}</strong>.
    </p>
    <a href="${appUrl}/beta-access" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:8px;">Redeem your code</a>
    <p style="font-size:12px;color:#6b7482;margin:32px 0 0;">
      RaidFi - contribution tracking and reputation infrastructure for Web3.<br/>
      If you didn't request access, you can ignore this email.
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
