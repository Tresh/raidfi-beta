import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post_url } = await req.json();
    if (!post_url) {
      return new Response(JSON.stringify({ error: "post_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch tweet text via oEmbed (no API key needed)
    let tweetText = "";
    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(post_url)}&omit_script=true`;
      const oembedRes = await fetch(oembedUrl);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        // Strip HTML tags from the embedded HTML to get plain text
        tweetText = (oembedData.html || "")
          .replace(/<[^>]*>/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, " ")
          .trim();
      }
    } catch (e) {
      console.error("oEmbed fetch failed:", e);
    }

    if (!tweetText) {
      // If we can't fetch the tweet, return neutral score
      return new Response(
        JSON.stringify({
          score_modifier: 0,
          verdict: "unverified",
          feedback: "We couldn't fetch your post content. Default points awarded.",
          points_earned: 10,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Send to Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a content quality analyzer for the RaidFi community — a web3/crypto community platform.

Analyze the following tweet/post and score it. You must call the "score_post" function with your analysis.

Scoring rules (score_modifier range: -5 to +5):
- High-quality, original, relevant to crypto/web3/RaidFi: +3 to +5
- Normal, acceptable post about the topic: 0
- Likely AI-generated content (be lenient, only light penalty): -1
- Low-effort, generic, or barely relevant: -2 to -3  
- Spam, completely irrelevant, or suspicious: -4 to -5

Be fair and encouraging. The feedback should help users improve their contributions.
Keep feedback to 1-2 sentences max.`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Analyze this post:\n\n"${tweetText}"` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "score_post",
                description:
                  "Score a community post for quality, relevance, and authenticity.",
                parameters: {
                  type: "object",
                  properties: {
                    score_modifier: {
                      type: "integer",
                      description:
                        "Score modifier from -5 to +5. 0 = normal, positive = good, negative = poor quality.",
                    },
                    verdict: {
                      type: "string",
                      enum: [
                        "excellent",
                        "good",
                        "acceptable",
                        "low_effort",
                        "ai_generated",
                        "spam",
                      ],
                      description: "Category verdict for the post.",
                    },
                    feedback: {
                      type: "string",
                      description:
                        "1-2 sentence feedback for the user on how to improve or why they scored well.",
                    },
                  },
                  required: ["score_modifier", "verdict", "feedback"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "score_post" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error("AI gateway error:", status, text);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fallback to neutral
      return new Response(
        JSON.stringify({
          score_modifier: 0,
          verdict: "unverified",
          feedback: "AI analysis unavailable. Default points awarded.",
          points_earned: 10,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let score_modifier = 0;
    let verdict = "acceptable";
    let feedback = "Post reviewed successfully.";

    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        score_modifier = Math.max(-5, Math.min(5, args.score_modifier || 0));
        verdict = args.verdict || "acceptable";
        feedback = args.feedback || "Post reviewed successfully.";
      } catch {
        console.error("Failed to parse AI tool call arguments");
      }
    }

    const points_earned = Math.max(1, 10 + score_modifier);

    return new Response(
      JSON.stringify({
        score_modifier,
        verdict,
        feedback,
        points_earned,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-contribution error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
