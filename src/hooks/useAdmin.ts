import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// All possible admin page permissions
export const ADMIN_PERMISSIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "points", label: "Points Manager" },
  { key: "waitlist", label: "Waitlist" },
  { key: "tasks", label: "Waitlist Tasks" },
  { key: "contribute-tasks", label: "Contribute Tasks" },
  { key: "validations", label: "Validations" },
  { key: "contacts", label: "Contacts" },
  { key: "whitepaper", label: "Whitepaper" },
  { key: "contributions", label: "Contributions" },
  { key: "beta", label: "Beta Requests" },
  { key: "projects", label: "Project Requests" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
] as const;

export type PermissionKey = typeof ADMIN_PERMISSIONS[number]["key"];


export function useAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/admin/login");
        return;
      }

      const uid = session.user.id;

      const { data: adminRole } = await supabase.rpc("has_role", {
        _user_id: uid,
        _role: "admin",
      });

      if (adminRole) {
        setUserId(uid);
        setUserEmail(session.user.email ?? null);
        setIsAdmin(true);
        setIsModerator(false);
        setPermissions(ADMIN_PERMISSIONS.map(p => p.key));
        setLoading(false);
        return;
      }

      const { data: modRole } = await supabase.rpc("has_role", {
        _user_id: uid,
        _role: "moderator",
      });

      if (modRole) {
        const { data: perms } = await supabase
          .from("moderator_permissions" as any)
          .select("permission")
          .eq("user_id", uid);

        const permKeys = (perms || []).map((p: any) => p.permission as string);

        setUserId(uid);
        setUserEmail(session.user.email ?? null);
        setIsAdmin(false);
        setIsModerator(true);
        setPermissions(permKeys);
        setLoading(false);
        return;
      }

      await supabase.auth.signOut();
      navigate("/admin/login");
    };

    check();
  }, [navigate]);

  const hasPermission = (key: string): boolean => {
    if (isAdmin) return true;
    // Settings is admin-only
    if (key === "settings") return false;
    return permissions.includes(key);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return { loading, isAdmin, isModerator, permissions, hasPermission, userId, userEmail, signOut };
}
