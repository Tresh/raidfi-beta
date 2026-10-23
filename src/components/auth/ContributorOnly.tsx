import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/** Blocks project accounts from contributor pages and sends them to their project workspace. */
export default function ContributorOnly({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "project">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (active) setState("ok"); return; }
      await supabase.rpc("claim_project_memberships" as any);
      const uid = session.user.id;
      const [{ data: isProject }, { data: isAdmin }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: uid, _role: "project_admin" as any }),
        supabase.rpc("is_staff" as any, { _user_id: uid }),
      ]);
      if (active) setState(isProject && !isAdmin ? "project" : "ok");
    })();
    return () => { active = false; };
  }, []);

  if (state === "loading") return <div className="min-h-screen bg-background" />;
  if (state === "project") return <Navigate to="/project" replace />;
  return <>{children}</>;
}
