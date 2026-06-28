// Mints a one-time Telegram link code for the authed user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function randomCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error } = await authClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (error || !claims?.claims?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const email = String(claims.claims.email).toLowerCase();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // If already linked, return that
    const { data: existing } = await supabase
      .from("telegram_links")
      .select("telegram_username,first_name,linked_at")
      .eq("email", email)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ linked: true, link: existing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reuse fresh unused code if present
    const { data: fresh } = await supabase
      .from("telegram_link_codes")
      .select("code,expires_at")
      .eq("email", email)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fresh) {
      return new Response(JSON.stringify({ code: fresh.code, expires_at: fresh.expires_at }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const code = randomCode(8);
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { error: insErr } = await supabase.from("telegram_link_codes").insert({
      code, email, expires_at, used: false,
    });
    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ code, expires_at }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
