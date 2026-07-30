// Verifies ownership of an X (Twitter) handle via a public verification post.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (h: string) => h.trim().replace(/^@/, "").toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userRes?.user;
    if (!user?.email) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const handle = clean(String(body.handle ?? ""));
    const postUrl = String(body.post_url ?? "").trim();

    if (!handle || !/^[a-z0-9_]{1,15}$/.test(handle)) {
      return json({ error: "Enter a valid X username." }, 400);
    }
    if (!/^https?:\/\/(www\.)?(twitter|x)\.com\/[^\s]+\/status\/\d+/i.test(postUrl)) {
      return json({ error: "Paste the direct link to your verification post." }, 400);
    }

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: profile } = await admin
      .from("profiles")
      .select("id,user_id,referral_code,x_username")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profile) return json({ error: "No profile found for this account." }, 404);

    // Already claimed by someone else?
    const { data: taken } = await admin
      .from("profiles")
      .select("user_id")
      .ilike("x_username", handle)
      .neq("user_id", user.id)
      .maybeSingle();
    if (taken) return json({ error: "That X username is already claimed by another contributor." }, 409);

    // Pull the post through oEmbed
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(postUrl)}&omit_script=1&dnt=1`;
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      return json({ error: "Could not read that post. Make sure it is public." }, 400);
    }
    const data = await res.json();
    const authorUrl: string = data.author_url ?? "";
    const authorHandle = clean(authorUrl.split("/").filter(Boolean).pop() ?? "");
    const html: string = data.html ?? "";
    const plain = html.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").toLowerCase();

    if (authorHandle !== handle) {
      return json({ error: `That post was made by @${authorHandle || "unknown"}, not @${handle}.` }, 400);
    }

    const challenge = String(profile.referral_code ?? "").toLowerCase();
    if (!challenge || !plain.includes(challenge)) {
      return json({ error: "The post does not contain your verification code." }, 400);
    }

    const { error: updErr } = await admin
      .from("profiles")
      .update({
        x_username: handle,
        x_verified: true,
        x_verified_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    if (updErr) {
      const dup = updErr.message?.includes("profiles_x_username_unique");
      return json({ error: dup ? "That X username is already claimed." : updErr.message }, dup ? 409 : 500);
    }

    return json({ ok: true, handle, author_name: data.author_name ?? null });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
