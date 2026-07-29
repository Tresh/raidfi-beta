import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContributorData } from "@/hooks/useContributorData";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Loader2, LogOut, Send } from "lucide-react";

const Settings = () => {
  useSEO({
    title: "Settings — RaidFi",
    description: "Manage your RaidFi identity, connected platforms and referral link.",
    path: "/dashboard/settings",
  });
  const { session, signOut } = useAuth();
  const { toast } = useToast();
  const data = useContributorData(session?.user?.email);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [tgCode, setTgCode] = useState<string | null>(null);
  const [tgLink, setTgLink] = useState<any>(null);
  const [tgLoading, setTgLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (data.profile?.name) setName(data.profile.name);
  }, [data.profile?.name]);

  const loadTelegram = async () => {
    setTgLoading(true);
    const { data: res } = await supabase.functions.invoke("telegram-link-code", { body: {} });
    if ((res as any)?.linked) {
      setTgLink((res as any).link);
      setTgCode(null);
    } else if ((res as any)?.code) {
      setTgLink(null);
      setTgCode((res as any).code);
    }
    setTgLoading(false);
  };

  useEffect(() => {
    if (session) loadTelegram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const saveName = async () => {
    if (!data.profile) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() || null })
      .eq("id", data.profile.id);
    setSavingName(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: "Your display name has been updated." });
    data.refresh();
  };

  const copy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const referralUrl = data.profile?.referral_code
    ? `${window.location.origin}/waitlist?ref=${data.profile.referral_code}`
    : null;

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Identity, connected platforms and your public profile." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Identity" description="How you appear on leaderboards and public profiles.">
          <div className="space-y-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Email</label>
              <Input value={session?.user?.email ?? ""} disabled className="h-10 text-sm mt-1.5" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                Display name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-10 text-sm mt-1.5"
              />
            </div>
            <Button onClick={saveName} disabled={savingName || !data.profile} className="h-9 text-sm">
              {savingName && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </div>
        </Panel>

        <Panel title="Telegram" description="Connect Telegram to submit and receive tasks from the bot.">
          {tgLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : tgLink ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-foreground">
                  Connected as{" "}
                  <span className="font-medium">
                    @{tgLink.telegram_username ?? tgLink.first_name ?? "telegram user"}
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Cross-platform footprint is contributing to your reputation.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Linked
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Open the RaidFi bot on Telegram and send <span className="font-mono">/link {tgCode}</span>{" "}
                to connect this account.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono tracking-[0.2em] px-3 py-2 rounded-md bg-muted text-foreground text-center">
                  {tgCode ?? "—"}
                </code>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => tgCode && copy(`/link ${tgCode}`, "tg")}
                >
                  {copied === "tg" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <a
                href="https://t.me/raidficontributionbot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary"
              >
                <Send className="w-3.5 h-3.5" /> Open the RaidFi bot
              </a>
            </div>
          )}
        </Panel>

        <Panel title="Referral link" description="Invite contributors and earn +50 XP for each one who joins.">
          {referralUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] px-3 py-2 rounded-md bg-muted text-foreground truncate">
                  {referralUrl}
                </code>
                <Button variant="outline" className="h-10" onClick={() => copy(referralUrl, "ref")}>
                  {copied === "ref" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {data.profile?.referral_count ?? 0} referral
                {(data.profile?.referral_count ?? 0) === 1 ? "" : "s"} so far.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No referral code on this account yet.</p>
          )}
        </Panel>

        <Panel title="Public profile" description="Your portable reputation page.">
          {data.profile?.referral_code ? (
            <a
              href={`/u/${data.profile.referral_code}`}
              className="text-xs text-primary break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {window.location.origin}/u/{data.profile.referral_code}
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">Available once your profile is set up.</p>
          )}
          <div className="pt-4 mt-4 border-t border-border">
            <Button variant="outline" onClick={signOut} className="h-9 text-sm text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </Panel>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
