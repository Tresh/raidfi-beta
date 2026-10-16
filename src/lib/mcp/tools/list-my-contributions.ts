import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_contributions",
  title: "List my contributions",
  description: "List the signed-in contributor's tracked X posts with status, score and XP earned.",
  inputSchema: {
    status: z.enum(["pending", "approved", "rejected"]).optional().describe("Only return posts with this status."),
    limit: z.number().int().min(1).max(100).default(20).describe("Maximum posts to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    const db = supabaseForUser(ctx);
    let q = db.from("contributions").select("id,post_url,status,content_type,points_earned,ai_score,manual_score,created_at")
      .ilike("user_email", ctx.getUserEmail() ?? "").order("created_at", { ascending: false }).limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw new ToolError(error.message);
    const contributions = (data ?? []).map((c) => ({
      id: c.id, post_url: c.post_url, status: c.status, content_type: c.content_type,
      xp: c.points_earned, score: c.manual_score ?? c.ai_score, created_at: c.created_at,
    }));
    return { content: [{ type: "text", text: JSON.stringify(contributions) }], structuredContent: { contributions } };
  },
});
