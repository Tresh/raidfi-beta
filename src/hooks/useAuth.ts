import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  referral_code: string;
  referral_count: number;
  waitlist_completed: boolean;
  x_shared: boolean;
}

// Module-level cache so switching dashboard pages doesn't re-trigger the
// full-screen loading state on every navigation.
let cachedSession: Session | null = null;
let cachedProfile: Profile | null = null;

export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!cachedSession);
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [profile, setProfile] = useState<Profile | null>(cachedProfile);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      cachedSession = session;
      setSession(session);
      if (!session) {
        cachedProfile = null;
        navigate("/login");
        return;
      }
    });

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        cachedSession = null;
        cachedProfile = null;
        navigate("/login");
        return;
      }

      cachedSession = session;
      setSession(session);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileData) {
        cachedProfile = profileData as any;
        setProfile(profileData as any);
      }

      setLoading(false);
    };

    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    cachedSession = null;
    cachedProfile = null;
    await supabase.auth.signOut();
    navigate("/login");
  };

  return { loading, session, profile, signOut };
}
