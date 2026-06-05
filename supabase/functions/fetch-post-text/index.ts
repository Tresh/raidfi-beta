import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Strip HTML tags and decode common entities
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contribution_id, post_url } = await req.json();
    if (!contribution_id || !post_url) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try oEmbed
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(post_url)}&omit_script=true&dnt=true`;
    let post_text: string | null = null;
    let post_author: string | null = null;
    try {
      const r = await fetch(oembedUrl, { headers: { "User-Agent": "RaidFiBot/1.0" } });
      if (r.ok) {
        const data = await r.json();
        if (data?.html) post_text = htmlToText(data.html);
        if (data?.author_name) post_author = data.author_name;
      }
    } catch (e) {
      console.warn("oEmbed failed", e);
    }

    if (post_text) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await supabase
        .from("contributions")
        .update({ post_text, post_author, post_fetched_at: new Date().toISOString() })
        .eq("id", contribution_id);
    }

    return new Response(JSON.stringify({ ok: true, post_text, post_author }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-post-text error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
