// Single entry point for contribution submissions from every surface
// (dashboard, contribute page, Telegram bot). Guarantees the exact same
// workflow: ownership check -> insert -> fetch post text/media -> notify admin
// -> post to the community feed.

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

const TWEET_URL_REGEX = /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/\s]+\/status\/\d+/i;
const clean = (v: string) => v.trim().replace(/^@/, "").toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const siteOrigin = Deno.env.get("SITE_ORIGIN") || "https://raidfi.site";

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Sign in before submitting a post." }, 401);
    const token = authHeader.slice(7);

    const body = await req.json().catch(() => ({}));
    const postUrl = String(body.post_url ?? "").trim();
    const contentType = String(body.content_type ?? "post").slice(0, 40);
    const aiGenerated = body.ai_generated === true;
    const mediaType = body.media_type === "image" ? "image" : "text";
    const origin = String(body.origin ?? siteOrigin);

    if (!TWEET_URL_REGEX.test(postUrl)) {
      return json({ error: "Paste a direct link to an X post." }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Identify the submitting contributor.
    let email: string | null = null;
    let userId: string | null = null;

    if (token === serviceKey) {
      // Trusted server-to-server call (Telegram bot).
      email = String(body.user_email ?? "").trim().toLowerCase() || null;
      if (!email) return json({ error: "user_email is required for service calls." }, 400);
    } else {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await authClient.auth.getUser(token);
      if (!userData?.user) return json({ error: "Your session has expired. Sign in again." }, 401);
      email = (userData.user.email ?? "").toLowerCase();
      userId = userData.user.id;
    }

    // Profile + verified X handle.
    let { data: profile } = await admin
      .from("profiles")
      .select("user_id,referral_code,x_username,x_verified")
      .eq(userId ? "user_id" : "email", userId ?? email)
      .maybeSingle();

    if (!profile && userId) {
      const { data: byEmail } = await admin
        .from("profiles")
        .select("user_id,referral_code,x_username,x_verified")
        .eq("email", email)
        .maybeSingle();
      profile = byEmail;
    }

    if (!profile?.x_verified || !profile?.x_username) {
      return json({ error: "Verify your X account in Settings before submitting contributions." }, 403);
    }

    // Ownership check — only posts from the contributor's verified account.
    const oembed = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(postUrl)}&omit_script=1&dnt=1`,
    );
    if (!oembed.ok) {
      return json({ error: "We couldn't read that post. Make sure it is public and try again." }, 400);
    }
    const post = await oembed.json();
    const authorHandle = clean(String(post.author_url ?? "").split("/").filter(Boolean).pop() ?? "");
    const verifiedHandle = clean(profile.x_username);
    if (!authorHandle || authorHandle !== verifiedHandle) {
      return json({
        error: `This post is from @${authorHandle || "unknown"}. Only posts from your verified @${verifiedHandle} account are accepted.`,
      }, 403);
    }

    const id = crypto.randomUUID();
    const { error: insertError } = await admin.from("contributions").insert({
      id,
      user_email: email,
      user_id: userId ?? profile.user_id ?? null,
      post_url: postUrl,
      content_type: contentType,
      ai_generated: aiGenerated,
      media_type: mediaType,
      status: "pending",
      published_to_feed: true,
    });
    if (insertError) return json({ error: insertError.message }, 400);

    // Same downstream pipeline for every surface.
    const fnUrl = `${supabaseUrl}/functions/v1`;
    const fnHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    };

    try {
      await fetch(`${fnUrl}/fetch-post-text`, {
        method: "POST",
        headers: fnHeaders,
        body: JSON.stringify({ contribution_id: id, post_url: postUrl }),
      });
    } catch (e) {
      console.warn("fetch-post-text failed", e);
    }

    fetch(`${fnUrl}/notify-admin-contribution`, {
      method: "POST",
      headers: fnHeaders,
      body: JSON.stringify({ contribution_id: id, post_url: postUrl, user_email: email }),
    }).catch(() => {});

    fetch(`${fnUrl}/notify-telegram`, {
      method: "POST",
      headers: fnHeaders,
      body: JSON.stringify({ kind: "feed", contribution_id: id, origin }),
    }).catch(() => {});

    return json({ ok: true, contribution_id: id });
  } catch (e) {
    console.error("submit-contribution error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
