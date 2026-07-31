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
import { Check, Copy, Loader2, LogOut, Send, Unlink, BadgeCheck } from "lucide-react";

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
  const [unlinking, setUnlinking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [xHandle, setXHandle] = useState("");
  const [xPostUrl, setXPostUrl] = useState("");
  const [xVerifying, setXVerifying] = useState(false);

  useEffect(() => {
    if (data.profile?.name) setName(data.profile.name);
    const existingHandle = (data.profile as any)?.x_username;
    if (existingHandle) setXHandle(existingHandle);
  }, [data.profile?.name, (data.profile as any)?.x_username]);

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

  const unlinkTelegram = async () => {
    setUnlinking(true);
    const { data: res, error } = await supabase.functions.invoke("telegram-unlink", { body: {} });
    setUnlinking(false);
    if (error || (res as any)?.error) {
      toast({ title: "Could not unlink", description: (res as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Telegram unlinked", description: "You can connect a different account any time." });
    setTgLink(null);
    loadTelegram();
    data.refresh();
  };

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

  const verifyX = async () => {
    const handle = xHandle.trim().replace(/^@/, "");
    const postUrl = xPostUrl.trim();
    if (!handle || !postUrl) {
      toast({ title: "Missing details", description: "Add your X username and the link to your post.", variant: "destructive" });
      return;
    }
    if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
      toast({ title: "Invalid username", description: "X usernames are 1–15 characters: letters, numbers and underscores only.", variant: "destructive" });
      return;
    }
    if (!/^https?:\/\/(www\.)?(twitter|x)\.com\/[^/\s]+\/status\/\d+/i.test(postUrl)) {
      toast({
        title: "That doesn't look like a post link",
        description: "Paste the direct link to your post, e.g. https://x.com/yourhandle/status/1234567890 — not your profile or a shortened link.",
        variant: "destructive",
      });
      return;
    }
    setXVerifying(true);

    const { data: taken } = await supabase.rpc("x_handle_taken", { _handle: handle });
    if (taken) {
      setXVerifying(false);
      toast({ title: "Already claimed", description: `@${handle} is already linked to another contributor.`, variant: "destructive" });
      return;
    }

    let message: string | null = null;
    try {
      const { data: res, error } = await supabase.functions.invoke("verify-x-handle", {
        body: { handle, post_url: postUrl },
      });

      if (error) {
        // Edge functions surface real reasons in the response body, not error.message.
        let detail = "";
        try {
          detail = (await (error as any)?.context?.text?.()) ?? "";
        } catch {
          detail = "";
        }
        try {
          message = detail ? (JSON.parse(detail).error as string) : null;
        } catch {
          message = detail || null;
        }
        message = message || "We couldn't verify that post right now. Please try again in a moment.";
      } else if ((res as any)?.error) {
        message = (res as any).error as string;
      }
    } catch {
      message = "Network problem — check your connection and try again.";
    }
    setXVerifying(false);

    if (message) {
      toast({ title: "Verification failed", description: message, variant: "destructive" });
      return;
    }
    toast({ title: "X account verified", description: `@${handle} is now linked to your profile.` });
    setXPostUrl("");
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

  const xVerified = Boolean((data.profile as any)?.x_verified);
  const verifiedHandle = (data.profile as any)?.x_username as string | undefined;
  const challenge = data.profile?.referral_code ?? "";
  const verificationPost = `Verifying my X account for @raidfi_app — building the credibility layer for Web3. ${challenge}`;

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
            <div className="space-y-3">
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
              <Button
                variant="outline"
                className="h-9 text-xs text-destructive"
                onClick={unlinkTelegram}
                disabled={unlinking}
              >
                {unlinking ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Unlink className="w-3.5 h-3.5 mr-2" />}
                Unlink Telegram
              </Button>
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

        <Panel title="X (Twitter)" description="Verify the account your contributions are posted from.">
          {xVerified ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-foreground flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                  Verified as <span className="font-medium">@{verifiedHandle}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Contributions from this handle are attributed to you automatically.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Verified
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  X username
                </label>
                <Input
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="h-10 text-sm mt-1.5"
                />
              </div>
              <div className="rounded-md bg-muted p-3 space-y-2">
                <p className="text-[11px] text-muted-foreground">
                  Post this on X, then paste the post link below.
                </p>
                <p className="text-xs text-foreground break-words">{verificationPost}</p>
                <Button
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => copy(verificationPost, "xpost")}
                  disabled={!challenge}
                >
                  {copied === "xpost" ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  Copy post
                </Button>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Post link
                </label>
                <Input
                  value={xPostUrl}
                  onChange={(e) => setXPostUrl(e.target.value)}
                  placeholder="https://x.com/you/status/..."
                  className="h-10 text-sm mt-1.5"
                />
              </div>
              <Button onClick={verifyX} disabled={xVerifying} className="h-9 text-sm">
                {xVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Verify account
              </Button>
            </div>
          )}
        </Panel>

        <Panel title="Discord" description="Bring your Discord activity into your reputation score.">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Discord linking is on the way — you'll be able to connect your server activity here.
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">
              Coming soon
            </span>
          </div>
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
                {(data.profile?.referral_count ?? 0) === 1 ? "" : "s"} so far — you earn +50 XP for each
                one who joins.
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
