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

function syndicationToken(id: string): string {
  const n = (Number(id) / 1e15) * Math.PI;
  return n.toString(36).replace(/(0+|\.)/g, "");
}

function extractTweetId(url: string): string | null {
  const m = url.match(/^https?:\/\/(?:x|twitter)\.com\/(?:\w+|i)\/status\/(\d+)/i);
  return m ? m[1] : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) {
      return json({ error: "Server configuration error" }, 500);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: authErr } = await authClient.auth.getUser(authHeader.slice(7));
    if (authErr || !userRes?.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const post_url = String(body?.post_url ?? "").trim();
    const tid = extractTweetId(post_url);

    if (!tid) {
      return json({ error: "Invalid or missing post_url parameter" }, 400);
    }

    let post_image_url: string | null = null;
    const tok = syndicationToken(tid);
    const sUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tid}&token=${tok}&lang=en`;
    const sr = await fetch(sUrl, { headers: { "User-Agent": "Mozilla/5.0 RaidFiBot/1.0" } });

    if (sr.ok) {
      const sd = await sr.json();
      const media = sd?.mediaDetails || sd?.photos || [];
      if (Array.isArray(media) && media.length > 0) {
        const first = media.find((m: any) => m?.media_url_https || m?.url);
        if (first) post_image_url = first.media_url_https || first.url;
      }
    }

    return json({ post_image_url });
  } catch (e) {
    console.error("fetch-post-image error:", e);
    return json({ error: "Failed to fetch post image" }, 500);
  }
});
