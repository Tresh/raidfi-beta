// Admin-only: register (or inspect) the Telegram bot webhook.
// Derives the same secret token the webhook endpoint verifies.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function deriveSecret(apiKey: string) {
  const data = new TextEncoder().encode(`telegram-webhook:${apiKey}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function tg(method: string, body: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) throw new Error("Telegram connection is not configured");
  const r = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) console.error("telegram error", method, r.status, JSON.stringify(data));
  return { status: r.status, ok: r.ok, data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization") ?? "";
    const bootstrap = authHeader === `Bearer ${serviceKey}`;

    if (!bootstrap) {
      if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
      const { data: userRes } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
      const user = userRes?.user;
      if (!user) return json({ error: "Unauthorized" }, 401);
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "super_admin");
      if (!isAdmin) return json({ error: "Admin access required" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "status");

    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    if (!TELEGRAM_API_KEY) return json({ error: "Telegram connection is not configured" }, 400);

    if (action === "register") {
      const secret = await deriveSecret(TELEGRAM_API_KEY);
      const url = `${supabaseUrl}/functions/v1/telegram-webhook`;
      const set = await tg("setWebhook", {
        url,
        secret_token: secret,
        allowed_updates: ["message", "edited_message", "callback_query", "my_chat_member", "chat_member"],
        drop_pending_updates: false,
      });
      const info = await tg("getWebhookInfo", {});
      const me = await tg("getMe", {});
      return json({ ok: set.ok, url, setWebhook: set.data, webhookInfo: info.data, bot: me.data });
    }

    const info = await tg("getWebhookInfo", {});
    const me = await tg("getMe", {});
    return json({ ok: info.ok, webhookInfo: info.data, bot: me.data });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
