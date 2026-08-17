import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectRecord {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  x_handle: string | null;
  description: string | null;
  verification_tier: string | null;
  x_verified?: boolean | null;
  x_verified_at?: string | null;

  trust_score: number | null;
  telegram: string | null;
  telegram_group_id: string | null;
  telegram_bot_added: boolean | null;
}


let cachedProject: ProjectRecord | null = null;
let cachedRole: string | null = null;

export function useProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!cachedProject);
  const [project, setProject] = useState<ProjectRecord | null>(cachedProject);
  const [role, setRole] = useState<string | null>(cachedRole);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }
      setEmail(session.user.email ?? null);

      const { data: membership } = await supabase
        .from("project_members" as any)
        .select("member_role, project_id, projects:project_id(*)")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const proj = (membership as any)?.projects ?? null;
      if (!proj) {
        setProject(null);
        setLoading(false);
        return;
      }

      cachedProject = proj;
      cachedRole = (membership as any).member_role ?? "member";
      setProject(proj);
      setRole(cachedRole);
      setLoading(false);
    };

    init();
  }, [navigate]);

  return { loading, project, role, email };
}
