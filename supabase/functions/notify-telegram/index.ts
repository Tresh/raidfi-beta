import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const maskEmail = (e: string) =>
  e.replace(/(.{3}).*(@.*)/, "$1***$2");

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

interface TgButton { text: string; url: string; }

async function sendTelegram(
  chatId: string,
  text: string,
  buttons: TgButton[],
) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    throw new Error("Telegram not configured");
  }
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (buttons.length) {
    body.reply_markup = {
      inline_keyboard: buttons.map((b) => [{ text: b.text, url: b.url }]),
    };
  }
  const r = await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`Telegram send failed [${r.status}]: ${JSON.stringify(data)}`);
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Internal server-to-server call (e.g. submit-contribution) skips user auth.
    const internal = authHeader === `Bearer ${serviceKey}`;
    let callerId: string | null = null;

    if (!internal) {
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(authHeader.replace("Bearer ", ""));
      if (claimsErr || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerId = claimsData.claims.sub as string;
    }

    const payload = await req.json();
    const { kind, contribution_id, task_id, origin, text: rawText } = payload;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceKey,
    );

    // For raw/test sends, require admin
    if (!internal && (kind === "test" || (!contribution_id && !task_id && rawText))) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: callerId,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: settings } = await supabase
      .from("admin_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();

    if (!settings?.telegram_enabled || !settings?.telegram_chat_id) {
      return new Response(JSON.stringify({ ok: true, skipped: "telegram disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (kind === "feed" && !settings.telegram_notify_feed) {
      return new Response(JSON.stringify({ ok: true, skipped: "feed notify off" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (kind === "task" && !settings.telegram_notify_tasks) {
      return new Response(JSON.stringify({ ok: true, skipped: "task notify off" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseOrigin = origin || "https://raidfi.app";

    // ---- TEST / RAW ----
    if (kind === "test" || (!contribution_id && !task_id && rawText)) {
      const result = await sendTelegram(settings.telegram_chat_id, rawText || "Test", []);
      return new Response(JSON.stringify({ ok: true, result: result.result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- FEED ----
    if (kind === "feed" && contribution_id) {
      // Brief retry to allow fetch-post-text to populate post_text
      let contrib: any = null;
      for (let i = 0; i < 4; i++) {
        const { data } = await supabase
          .from("contributions")
          .select("id,user_email,user_id,post_url,content_type,post_text,post_author,manual_score,ai_score,status,project_id")
          .eq("id", contribution_id)
          .maybeSingle();
        contrib = data;
        if (contrib?.post_text) break;
        await new Promise((r) => setTimeout(r, 800));
      }
      if (!contrib) {
        return new Response(JSON.stringify({ ok: false, error: "contribution not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const [{ data: profile }, { data: ct }] = await Promise.all([
        supabase.from("profiles").select("name,referral_code").eq("user_id", contrib.user_id).maybeSingle(),
        supabase.from("content_types").select("label").eq("value", contrib.content_type).maybeSingle(),
      ]);

      const handleOrName = contrib.post_author
        ? `@${escapeHtml(contrib.post_author.replace(/^@/, ""))}`
        : profile?.name
          ? escapeHtml(profile.name)
          : escapeHtml(maskEmail(contrib.user_email));

      const typeLabel = ct?.label || (contrib.content_type?.[0]?.toUpperCase() + contrib.content_type?.slice(1)) || "Post";

      const snippet = contrib.post_text
        ? `"${escapeHtml(truncate(contrib.post_text.replace(/\s+/g, " ").trim(), 220))}"`
        : "<i>Content unavailable - open the post to view.</i>";

      const status = contrib.status === "approved"
        ? `Approved${contrib.manual_score ?? contrib.ai_score ? ` · +${contrib.manual_score ?? contrib.ai_score} XP` : ""}`
        : `Awaiting review`;

      const lines = [
        `<b>New contribution from ${handleOrName}</b>`,
        `<i>${escapeHtml(typeLabel)} · ${status}</i>`,
        "",
        snippet,
      ];

      const buttons: TgButton[] = [
        { text: "View post", url: contrib.post_url },
      ];
      if (profile?.referral_code) {
        buttons.push({ text: "View contributor", url: `${baseOrigin}/u/${profile.referral_code}` });
      }

      // Project's own group, when the post is tied to a project with a connected group.
      let project: any = null;
      if (contrib.project_id) {
        const { data: p } = await supabase
          .from("projects").select("id,name,slug,telegram_group_id")
          .eq("id", contrib.project_id).maybeSingle();
        project = p;
        if (p?.name) lines.splice(2, 0, `Project: <b>${escapeHtml(p.name)}</b>`);
      }

      const result = await sendTelegram(settings.telegram_chat_id, lines.join("\n"), buttons);

      let projectGroup: "sent" | "failed" | "none" = "none";
      if (project?.telegram_group_id && String(project.telegram_group_id) !== String(settings.telegram_chat_id)) {
        const projectButtons = [...buttons];
        if (project.slug) {
          projectButtons.push({ text: "Project page", url: `${baseOrigin}/p/${project.slug}` });
        }
        try {
          await sendTelegram(String(project.telegram_group_id), lines.join("\n"), projectButtons);
          projectGroup = "sent";
        } catch (e) {
          projectGroup = "failed";
          console.error("project group send failed", project.id, e instanceof Error ? e.message : e);
        }
      }

      return new Response(JSON.stringify({ ok: true, result: result.result, projectGroup }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- TASK ----
    if (kind === "task" && task_id) {
      const { data: task } = await supabase
        .from("contribute_tasks")
        .select("id,label,description,points,url,action_types,is_pinned,created_at")
        .eq("id", task_id)
        .maybeSingle();
      if (!task) {
        return new Response(JSON.stringify({ ok: false, error: "task not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Map action_type values to labels
      let actionLabels: string[] = task.action_types || [];
      if (actionLabels.length) {
        const { data: ats } = await supabase
          .from("task_action_types")
          .select("value,label")
          .in("value", actionLabels);
        if (ats) {
          const map = new Map(ats.map((a: any) => [a.value, a.label]));
          actionLabels = actionLabels.map((v) => map.get(v) || v);
        }
      }

      const isPinned = !!task.is_pinned;

      const lines: string[] = [
        isPinned
          ? `<b>📌 Pinned task · ${escapeHtml(task.label || "Untitled")}</b>`
          : `<b>New task · ${escapeHtml(task.label || "Untitled")}</b>`,
        `<i>+${task.points} XP</i>`,
      ];

      if (task.description) {
        lines.push("", escapeHtml(task.description));
      }

      if (actionLabels.length) {
        lines.push("", `<b>What to do</b>`, ...actionLabels.map((a) => `• ${escapeHtml(a)}`));
      }

      const buttons: TgButton[] = [
        { text: "Do task", url: `${baseOrigin}/contributions` },
      ];

      const groupResult = await sendTelegram(settings.telegram_chat_id, lines.join("\n"), buttons);

      // Fan out DMs to every linked + subscribed Telegram user (best effort).
      let dmSent = 0, dmFailed = 0;
      try {
        const { data: links } = await supabase
          .from("telegram_links")
          .select("telegram_chat_id")
          .eq("dm_subscribed", true);
        if (links?.length) {
          await Promise.all(links.map(async (l: any) => {
            try {
              await sendTelegram(String(l.telegram_chat_id), lines.join("\n"), buttons);
              dmSent++;
            } catch (e) {
              dmFailed++;
              console.warn("DM fail", l.telegram_chat_id, e instanceof Error ? e.message : e);
            }
          }));
        }
      } catch (e) {
        console.error("dm fanout error", e);
      }

      return new Response(JSON.stringify({ ok: true, group: groupResult.result, dmSent, dmFailed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- FALLBACK: raw text ----
    if (rawText) {
      const result = await sendTelegram(settings.telegram_chat_id, rawText, []);
      return new Response(JSON.stringify({ ok: true, result: result.result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Missing payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-telegram error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
