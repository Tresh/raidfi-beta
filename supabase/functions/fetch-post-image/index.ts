import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function syndicationToken(id: string): string {
  const n = (Number(id) / 1e15) * Math.PI;
  return n.toString(36).replace(/(0+|\.)/g, "");
}

function extractTweetId(url: string): string | null {
  const m = url.match(/^https?:\/\/(?:x|twitter)\.com\/(?:\w+|i)\/status\/(\d+)/i);
  return m ? m[1] : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { post_url } = await req.json();
    const tid = post_url ? extractTweetId(post_url) : null;
    let post_image_url: string | null = null;
    if (tid) {
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
    }
    return new Response(JSON.stringify({ post_image_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ post_image_url: null, error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
