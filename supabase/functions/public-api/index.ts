// RaidFi Developer API. Auth: Authorization: Bearer rf_live_...
// Scopes: "reputation" (scoring only) | "full" (contributions, metrics, verify).
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function sha256(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function tier(xp: number) {
  if (xp >= 5000) return "Legend";
  if (xp >= 2000) return "Elite";
  if (xp >= 750) return "Trusted";
  if (xp >= 200) return "Rising";
  return "Newcomer";
}

async function reputationFor(identifier: string) {
  const id = identifier.trim().replace(/^@/, "").toLowerCase();
  let q = db.from("profiles").select("email,name,x_username,x_verified,total_points,referral_code,created_at");
  q = id.includes("@") ? q.ilike("email", id) : q.ilike("x_username", id);
  const { data: p } = await q.limit(1).maybeSingle();
  if (!p) return null;
  const { data: c } = await db.from("contributions").select("status,ai_score,manual_score").ilike("user_email", p.email);
  const all = c ?? [];
  const ok = all.filter((x) => x.status === "approved");
  const avg = ok.length ? ok.reduce((s, x) => s + (x.manual_score ?? x.ai_score ?? 0), 0) / ok.length : 0;
  const xp = p.total_points ?? 0;
  const acceptance = all.length ? ok.length / all.length : 0;
  const score = Math.round(Math.min(1000, xp * 0.1 + avg * 3 + acceptance * 200 + (p.x_verified ? 50 : 0)));
  return {
    handle: p.x_username, name: p.name, x_verified: p.x_verified, total_xp: xp,
    reputation_score: score, tier: tier(xp), contributions: all.length, accepted: ok.length,
    acceptance_rate: Math.round(acceptance * 1000) / 10, avg_quality: Math.round(avg * 10) / 10,
    member_since: p.created_at,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const raw = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "") || req.headers.get("x-api-key") || "";
  if (!raw.startsWith("rf_live_")) return json({ error: "Missing API key" }, 401);
  const { data: key } = await db.from("project_api_keys").select("*").eq("key_hash", await sha256(raw)).is("revoked_at", null).maybeSingle();
  if (!key) return json({ error: "Invalid or revoked API key" }, 401);
  db.from("project_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id).then(() => {});

  const url = new URL(req.url);
  const path = url.pathname.replace(/^.*\/public-api/, "").replace(/\/+$/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  const full = key.scope === "full";
  const needFull = () => json({ error: "This key only has the reputation scope" }, 403);

  try {
    // ---- Reputation scope ----
    if (req.method === "GET" && parts[0] === "reputation" && parts[1]) {
      const r = await reputationFor(decodeURIComponent(parts[1]));
      return r ? json(r) : json({ error: "Contributor not found" }, 404);
    }
    if (req.method === "POST" && parts[0] === "reputation" && parts[1] === "batch") {
      const body = await req.json().catch(() => ({}));
      const ids: unknown = body?.identifiers;
      if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) return json({ error: "identifiers must be an array of 1-100 strings" }, 400);
      const out: Record<string, unknown> = {};
      for (const i of ids) if (typeof i === "string") out[i] = await reputationFor(i);
      return json({ results: out });
    }
    if (req.method === "GET" && parts[0] === "leaderboard") {
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 25)));
      const { data } = await db.from("leaderboard_scores").select("display_name,total_xp").order("total_xp", { ascending: false }).limit(limit);
      return json({ leaderboard: (data ?? []).map((r, i) => ({ rank: i + 1, ...r, tier: tier(r.total_xp) })) });
    }

    // ---- Full scope ----
    if (parts[0] === "contributions" && req.method === "GET") {
      if (!full) return needFull();
      const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
      let q = db.from("contributions").select("id,user_email,post_url,post_text,status,content_type,points_earned,ai_score,manual_score,created_at")
        .eq("project_id", key.project_id).order("created_at", { ascending: false }).limit(limit);
      const st = url.searchParams.get("status");
      if (st) q = q.eq("status", st);
      const { data } = await q;
      return json({ contributions: (data ?? []).map((c) => ({ ...c, user_email: c.user_email.replace(/^(.{2}).*(@.*)$/, "$1***$2") })) });
    }
    if (parts[0] === "contributions" && req.method === "POST" && !parts[1]) {
      if (!full) return needFull();
      const b = await req.json().catch(() => ({}));
      if (typeof b?.email !== "string" || typeof b?.post_url !== "string" || !/^https:\/\/(x|twitter)\.com\//.test(b.post_url))
        return json({ error: "email and a valid X post_url are required" }, 400);
      const { data, error } = await db.from("contributions").insert({
        user_email: b.email.toLowerCase().trim(), post_url: b.post_url, project_id: key.project_id, status: "pending",
        content_type: typeof b.content_type === "string" ? b.content_type : "post",
      }).select("id,status").single();
      if (error) return json({ error: error.message }, 400);
      return json(data, 201);
    }
    if (parts[0] === "contributions" && parts[2] === "verify" && req.method === "PATCH") {
      if (!full) return needFull();
      const b = await req.json().catch(() => ({}));
      if (!["approved", "rejected"].includes(b?.status)) return json({ error: "status must be approved or rejected" }, 400);
      const upd: Record<string, unknown> = { status: b.status };
      if (Number.isInteger(b.points)) upd.points_earned = Math.max(0, Math.min(1000, b.points));
      const { data, error } = await db.from("contributions").update(upd).eq("id", parts[1]).eq("project_id", key.project_id).select("id,status,points_earned").maybeSingle();
      if (error || !data) return json({ error: "Contribution not found for this project" }, 404);
      return json(data);
    }
    if (parts[0] === "metrics" && req.method === "GET") {
      if (!full) return needFull();
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data } = await db.from("contributions").select("status,user_email,points_earned").eq("project_id", key.project_id).gte("created_at", since);
      const rows = data ?? [];
      return json({
        period_days: 30, contributions: rows.length,
        accepted: rows.filter((r) => r.status === "approved").length,
        contributors: new Set(rows.map((r) => r.user_email.toLowerCase())).size,
        xp_awarded: rows.filter((r) => r.status === "approved").reduce((s, r) => s + (r.points_earned ?? 0), 0),
      });
    }
    return json({ error: "Not found", endpoints: ["GET /reputation/:handle", "POST /reputation/batch", "GET /leaderboard", "GET|POST /contributions", "PATCH /contributions/:id/verify", "GET /metrics"] }, 404);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
