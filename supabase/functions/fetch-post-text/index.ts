import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Twitter syndication token algorithm
function syndicationToken(id: string): string {
  // ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '')
  const n = (Number(id) / 1e15) * Math.PI;
  return n.toString(36).replace(/(0+|\.)/g, "");
}

function extractTweetId(url: string): string | null {
  const m = url.match(/^https?:\/\/(?:x|twitter)\.com\/\w+\/status\/(\d+)/i);
  return m ? m[1] : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authedClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await authedClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub as string;

    const { contribution_id, post_url } = await req.json();
    if (!contribution_id || !post_url) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ownership / admin check
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: contribRow } = await adminClient
      .from("contributions")
      .select("user_id")
      .eq("id", contribution_id)
      .maybeSingle();
    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (!contribRow || (contribRow.user_id !== callerId && !isAdmin)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let post_text: string | null = null;
    let post_author: string | null = null;
    let post_image_url: string | null = null;

    // 1. Try syndication endpoint (richer: text + media)
    const tid = extractTweetId(post_url);
    if (tid) {
      try {
        const tok = syndicationToken(tid);
        const sUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tid}&token=${tok}&lang=en`;
        const sr = await fetch(sUrl, { headers: { "User-Agent": "Mozilla/5.0 RaidFiBot/1.0" } });
        if (sr.ok) {
          const sd = await sr.json();
          if (sd?.text) post_text = sd.text;
          if (sd?.user?.name && sd?.user?.screen_name) {
            post_author = `${sd.user.name} (@${sd.user.screen_name})`;
          }
          // Find first image from mediaDetails or photos
          const media = sd?.mediaDetails || sd?.photos || [];
          if (Array.isArray(media) && media.length > 0) {
            const first = media.find((m: any) => m?.media_url_https || m?.url);
            if (first) post_image_url = first.media_url_https || first.url;
          }
        }
      } catch (e) {
        console.warn("syndication failed", e);
      }
    }

    // 2. Fallback to oEmbed if syndication gave nothing
    if (!post_text) {
      try {
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(post_url)}&omit_script=true&dnt=true`;
        const r = await fetch(oembedUrl, { headers: { "User-Agent": "RaidFiBot/1.0" } });
        if (r.ok) {
          const data = await r.json();
          if (data?.html) post_text = htmlToText(data.html);
          if (data?.author_name && !post_author) post_author = data.author_name;
        }
      } catch (e) {
        console.warn("oEmbed failed", e);
      }
    }

    if (post_text || post_author) {
      await adminClient
        .from("contributions")
        .update({
          post_text,
          post_author,
          post_fetched_at: new Date().toISOString(),
        })
        .eq("id", contribution_id);
    }

    return new Response(
      JSON.stringify({ ok: true, post_text, post_author, post_image_url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("fetch-post-text error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
