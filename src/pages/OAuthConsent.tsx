import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OAuthResult = { data: any; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("This link is missing its request ID.");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        window.location.href = "/login?next=" + encodeURIComponent(window.location.pathname + window.location.search);
        return;
      }
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) { window.location.href = immediate; return; }
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error } = approve ? await oauth().approveAuthorization(authorizationId) : await oauth().denyAuthorization(authorizationId);
    if (error) { setBusy(false); return setError(error.message); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("No redirect was returned. Please try again."); }
    window.location.href = target;
  };

  const name = details?.client?.name ?? "An app";
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4 text-center">
        <img src="/logo.png" alt="RaidFi" className="h-10 mx-auto" />
        {error ? (
          <p className="text-sm text-destructive">Couldn't load this request: {error}</p>
        ) : !details ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-foreground">Connect {name} to RaidFi</h1>
            <p className="text-sm text-muted-foreground">
              {name} will be able to read your RaidFi profile, reputation and contributions, and submit posts as you.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>Deny</Button>
              <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>Approve</Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
