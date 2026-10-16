import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_leaderboard",
  title: "Get leaderboard",
  description: "Return the RaidFi contributor leaderboard for a period.",
  inputSchema: {
    period: z.enum(["all", "day", "week", "month"]).default("all").describe("Time period."),
    limit: z.number().int().min(1).max(100).default(25).describe("Number of entries."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ period, limit }, ctx) => {
    const db = supabaseForUser(ctx);
    const { data, error } = await db.rpc("get_leaderboard", { _period: period });
    if (error) throw new ToolError(error.message);
    const leaderboard = (data ?? []).slice(0, limit).map((r, i) => ({
      rank: i + 1, name: r.display_name, period_xp: r.period_xp, total_xp: r.total_xp,
    }));
    return { content: [{ type: "text", text: JSON.stringify(leaderboard) }], structuredContent: { leaderboard } };
  },
});
