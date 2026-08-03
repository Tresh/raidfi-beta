// Admin-only: approve or reject a project access request. Approving creates the
// project workspace and emails the founder a beta access code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "project";

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = new Uint8Array(6);
  crypto.getRandomValues(buf);
  let out = "RAID";
  for (let i = 0; i < buf.length; i++) out += chars[buf[i] % chars.length];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userRes?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "super_admin");
    if (!isAdmin) return json({ error: "Admin access required" }, 403);

    const body = await req.json().catch(() => ({}));
    const requestId = String(body.request_id ?? "");
    const action = String(body.action ?? "approve");
    if (!requestId) return json({ error: "request_id is required" }, 400);

    const { data: request } = await admin
      .from("project_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();
    if (!request) return json({ error: "Request not found" }, 404);

    if (action === "reject") {
      await admin
        .from("project_requests")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", requestId);
      return json({ ok: true, status: "rejected" });
    }

    // Create the project workspace
    const slug = slugify(request.project_name);
    const { data: project, error: projErr } = await admin
      .from("projects")
      .upsert(
        {
          name: request.project_name,
          slug,
          website: request.website,
          x_handle: request.x_handle,
          telegram: request.telegram,
          discord: request.discord,
          founder_name: request.founder_name,
          contact_email: request.email,
          description: request.why,
        },
        { onConflict: "slug" },
      )
      .select()
      .maybeSingle();
    if (projErr) return json({ error: projErr.message }, 500);

    // Mint a beta code for the founder with the project_admin role
    const code = makeCode();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await admin.from("beta_requests").insert({
      email: request.email,
      name: request.founder_name,
      x_handle: request.x_handle,
      requested_role: "project_admin",
      reason: `Project workspace: ${request.project_name}`,
      status: "approved",
      code,
      expires_at: expiresAt.toISOString(),
      reviewed_at: new Date().toISOString(),
      max_uses: 1,
    });

    await admin
      .from("project_requests")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", requestId);

    let emailed = false;
    let emailError: string | null = null;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateName: "beta-access",
          recipientEmail: request.email,
          templateData: {
            code,
            name: request.founder_name ?? "",
            appUrl: "https://raidfi.site",
            expiresAt: expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          },
        }),
      });
      emailed = res.ok;
      if (!res.ok) emailError = await res.text();
    } catch (e) {
      emailError = e instanceof Error ? e.message : "Unknown email error";
    }

    return json({ ok: true, status: "approved", code, project_id: project?.id, emailed, emailError });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
