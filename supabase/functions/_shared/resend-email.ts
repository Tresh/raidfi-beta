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
<body style="margin:0;padding:0;background-color:#071513;font-family:'Inter',Arial,Helvetica,sans-serif;color:#e1f5f2;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="margin-bottom:28px;">
      <span style="font-size:22px;font-weight:700;color:#2dd4bf;letter-spacing:-0.5px;">RaidFi</span>
    </div>
    <div style="background-color:#0e2421;border:1px solid #1a3c37;border-radius:16px;padding:32px;box-shadow:0 10px 25px rgba(0,0,0,0.3);">
      <h1 style="font-size:22px;margin:0 0 16px;color:#ffffff;font-weight:700;">You're in, ${name ? escapeHtml(name) : "there"}.</h1>
      <p style="font-size:15px;line-height:1.6;color:#93c5fd;color:#a3e635;color:#94a3b8;color:#a7f3d0;margin:0 0 24px;">
        Your RaidFi beta access has been approved. Use this access code to sign up:
      </p>
      <div style="background-color:#081c19;border:1px dashed #14b8a6;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
        <span style="font-size:28px;letter-spacing:6px;font-weight:bold;color:#2dd4bf;font-family:monospace;">${code}</span>
      </div>
      <p style="font-size:14px;color:#94a3b8;margin:0 0 24px;">
        The code is valid until <strong style="color:#ffffff;">${expiresAt}</strong>.
      </p>
      <a href="${appUrl}/signup?code=${encodeURIComponent(code)}" style="display:inline-block;background-color:#0d9488;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:10px;box-shadow:0 4px 12px rgba(13,148,136,0.3);">Redeem your code</a>
    </div>
    <p style="font-size:12px;color:#4a6b66;margin:28px 0 0;text-align:center;line-height:1.5;">
      RaidFi — Reputation & Social Intelligence Layer for Web3.<br/>
      If you didn't request access, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
