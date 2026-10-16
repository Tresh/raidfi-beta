import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Get my RaidFi profile",
  description: "Return the signed-in contributor's RaidFi profile: name, X handle, verification, XP and referral code.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const db = supabaseForUser(ctx);
    const { data, error } = await db.from("profiles").select("name,email,x_username,x_verified,total_points,referral_code,referral_count,created_at")
      .eq("user_id", ctx.getUserId() ?? "").maybeSingle();
    if (error) throw new ToolError(error.message);
    if (!data) throw new ToolError("No RaidFi profile found for this account.");
    const profile = {
      name: data.name, email: data.email, x_username: data.x_username, x_verified: data.x_verified,
      total_xp: data.total_points ?? 0, referral_code: data.referral_code, referrals: data.referral_count ?? 0, member_since: data.created_at,
    };
    return { content: [{ type: "text", text: JSON.stringify(profile) }], structuredContent: { profile } };
  },
});
