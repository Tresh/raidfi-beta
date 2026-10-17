import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { out } from "../api";

export const submitContribution = defineTool({
  name: "submit_contribution",
  title: "Submit an X post",
  description: "Submit one of your X posts to RaidFi for review, optionally for a specific project (by slug).",
  inputSchema: {
    post_url: z.string().regex(/^https:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/, "Must be an X post link"),
    project_slug: z.string().max(100).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ post_url, project_slug }, ctx) => {
    const db = supabaseForUser(ctx);
    const email = ctx.getUserEmail();
    if (!email) throw new ToolError("Your account has no email.");
    let project_id: string | null = null;
    if (project_slug) {
      const { data } = await db.from("projects").select("id").eq("slug", project_slug).maybeSingle();
      if (!data) throw new ToolError(`No project with slug "${project_slug}".`);
      project_id = data.id;
    }
    const { data: dup } = await db.from("contributions").select("id").eq("post_url", post_url).maybeSingle();
    if (dup) throw new ToolError("This post was already submitted.");
    const { data, error } = await db.from("contributions")
      .insert({ post_url, user_email: email.toLowerCase(), user_id: ctx.getUserId?.() ?? null, project_id, status: "pending" })
      .select("id,status").single();
    if (error) throw new ToolError(error.message);
    return out({ ...data, message: "Submitted. It will be reviewed shortly." });
  },
});

export const analyzeMyPerformance = defineTool({
  name: "analyze_my_performance",
  title: "Analyze my performance",
  description: "Summarize your contribution history: acceptance rate, average score, best content types, recent rejection notes and concrete tips to improve your reputation.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_i, ctx) => {
    const db = supabaseForUser(ctx);
    const { data, error } = await db.from("contributions")
      .select("status,content_type,points_earned,ai_score,manual_score,ai_feedback,admin_notes,created_at")
      .ilike("user_email", ctx.getUserEmail() ?? "").order("created_at", { ascending: false }).limit(300);
    if (error) throw new ToolError(error.message);
    const rows = data ?? [];
    const done = rows.filter((r) => r.status !== "pending");
    const ok = rows.filter((r) => r.status === "approved");
    const scores = ok.map((r) => r.manual_score ?? r.ai_score).filter((s): s is number => s != null);
    const byType: Record<string, { total: number; approved: number; xp: number }> = {};
    for (const r of rows) {
      const t = (byType[r.content_type] ??= { total: 0, approved: 0, xp: 0 });
      t.total++; if (r.status === "approved") { t.approved++; t.xp += r.points_earned ?? 0; }
    }
    const rejection_notes = rows.filter((r) => r.status === "rejected").map((r) => r.admin_notes || r.ai_feedback).filter(Boolean).slice(0, 10);
    const acceptance = done.length ? Math.round((ok.length / done.length) * 100) : 0;
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const tips: string[] = [];
    if (!rows.length) tips.push("Submit your first X post about a project to start building reputation.");
    if (acceptance < 60 && done.length >= 3) tips.push("Many posts are rejected — read the notes below and focus on original, detailed posts about the project.");
    if (avg != null && avg < 60) tips.push("Your quality score is low — add your own analysis, visuals or threads instead of short reposts.");
    const best = Object.entries(byType).sort((a, b) => b[1].xp - a[1].xp)[0];
    if (best) tips.push(`Your "${best[0]}" posts earn the most XP — do more of these.`);
    return out({ total: rows.length, pending: rows.length - done.length, acceptance_rate: acceptance, average_score: avg,
      xp_earned: ok.reduce((s, r) => s + (r.points_earned ?? 0), 0), by_content_type: byType, rejection_notes, tips });
  },
});
