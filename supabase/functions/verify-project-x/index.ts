// Verifies ownership of a project's X (Twitter) account via a public verification post.
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

const clean = (h: string) => h.trim().replace(/^@/, "").toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userRes?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const projectId = String(body.project_id ?? "");
    const handle = clean(String(body.handle ?? ""));
    const postUrl = String(body.post_url ?? "").trim();

    if (!projectId) return json({ error: "Missing project." }, 400);
    if (!handle || !/^[a-z0-9_]{1,15}$/.test(handle)) {
      return json({ error: "Enter a valid X username." }, 400);
    }
    if (!/^https?:\/\/(www\.)?(twitter|x)\.com\/[^\s]+\/status\/\d+/i.test(postUrl)) {
      return json({ error: "Paste the direct link to your verification post." }, 400);
    }

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Caller must be an owner/admin/manager of this project.
    const { data: membership } = await admin
      .from("project_members")
      .select("member_role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    const role = (membership as any)?.member_role ?? "";
    if (!["owner", "manager", "project_admin"].includes(role)) {
      return json({ error: "You don't have permission to change this project." }, 403);
    }

    const { data: project } = await admin
      .from("projects")
      .select("id,slug")
      .eq("id", projectId)
      .maybeSingle();
    if (!project) return json({ error: "Project not found." }, 404);

    const { data: taken } = await admin
      .from("projects")
      .select("id")
      .ilike("x_handle", handle)
      .eq("x_verified", true)
      .neq("id", projectId)
      .maybeSingle();
    if (taken) return json({ error: "That X account is already verified by another project." }, 409);

    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(postUrl)}&omit_script=1&dnt=1`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return json({ error: "Could not read that post. Make sure it is public." }, 400);

    const data = await res.json();
    const authorHandle = clean((data.author_url ?? "").split("/").filter(Boolean).pop() ?? "");
    const plain = String(data.html ?? "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").toLowerCase();

    if (authorHandle !== handle) {
      return json({ error: `That post was made by @${authorHandle || "unknown"}, not @${handle}.` }, 400);
    }

    const challenge = `raidfi-${String((project as any).slug ?? "").toLowerCase()}`;
    if (!plain.includes(challenge)) {
      return json({ error: `The post must contain your verification code: ${challenge}` }, 400);
    }

    const { error: updateError } = await admin
      .from("projects")
      .update({ x_handle: handle, x_verified: true, x_verified_at: new Date().toISOString() })
      .eq("id", projectId);
    if (updateError) return json({ error: "Could not save the verification. Try again." }, 500);

    return json({ ok: true, handle });
  } catch (_e) {
    return json({ error: "Something went wrong verifying that post." }, 500);
  }
});
