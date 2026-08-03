import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const clean = (value: string) => value.trim().replace(/^@/, "").toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Sign in before submitting a post." }, 401);
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return json({ error: "Server configuration error." }, 500);

    const body = await req.json().catch(() => ({}));
    const postUrl = String(body.post_url ?? "").trim();
    if (!/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/\s]+\/status\/\d+/i.test(postUrl)) {
      return json({ error: "Paste a direct link to an X post." }, 400);
    }

    const auth = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await auth.auth.getUser(authHeader.slice(7));
    const user = userData.user;
    if (!user) return json({ error: "Your session has expired. Sign in again." }, 401);

    const admin = createClient(url, serviceKey);
    const { data: profile } = await admin.from("profiles").select("x_username,x_verified").eq("user_id", user.id).maybeSingle();
    if (!profile?.x_verified || !profile.x_username) {
      return json({ error: "Verify your X account in Settings before submitting contributions." }, 403);
    }

    const response = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(postUrl)}&omit_script=1&dnt=1`);
    if (!response.ok) return json({ error: "We could not read this post. Make sure it is public and try again." }, 400);
    const post = await response.json();
    const authorHandle = clean(String(post.author_url ?? "").split("/").filter(Boolean).pop() ?? "");
    const verifiedHandle = clean(profile.x_username);
    if (!authorHandle || authorHandle !== verifiedHandle) {
      return json({ error: `This post is from @${authorHandle || "unknown"}. Only posts from your verified @${verifiedHandle} account are accepted.` }, 403);
    }

    return json({ valid: true, handle: verifiedHandle });
  } catch (error) {
    console.error("validate-x-post-owner failed", error);
    return json({ error: "We could not verify this post right now. Please try again." }, 500);
  }
});