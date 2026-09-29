import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Lightbulb, X } from "lucide-react";

const TIPS: Record<string, string> = {
  "/dashboard": "Your overview: XP, rank and recent activity. Submit X posts about projects to earn reputation.",
  "/dashboard/contributions": "Paste a link to your X post, pick the project it's about, and we score it. Approved posts earn XP.",
  "/dashboard/reputation": "Your reputation grows with consistent, quality contributions over time, not just volume.",
  "/dashboard/analytics": "See how your posts perform and which projects you contribute to most.",
  "/dashboard/referrals": "Share your 5 invite codes or referral link. You earn XP when friends join, and can recommend projects.",
  "/dashboard/settings": "Verify your X account and connect Telegram so you can submit posts from the bot.",
  "/dashboard/feedback": "Found a bug or have an idea? Tell us here.",
  "/project": "Your project overview: contributors, posts and growth at a glance.",
  "/project/contributors": "Everyone contributing to your project, ranked by quality and consistency.",
  "/project/activity": "Every post mentioning your project, as it comes in.",
  "/project/analytics": "Trends over time for contributions, quality and reach.",
  "/project/evaluate": "Review and score contributions for your project.",
  "/project/ai-analyst": "Ask questions about your community in plain language.",
  "/project/settings": "Verify your X account and link your Telegram group with /connectproject.",
};

const PageTip = () => {
  const { pathname } = useLocation();
  const key = pathname.replace(/\/$/, "");
  const tip = TIPS[key];
  const isProject = key.startsWith("/project");
  const storeKey = `tip-seen:${key}`;
  const [open, setOpen] = useState(false);
  const welcomeKey = isProject ? "welcome-project" : "welcome-contrib";
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    setOpen(!!tip && !localStorage.getItem(storeKey));
    setWelcome(!localStorage.getItem(welcomeKey));
  }, [storeKey, tip, welcomeKey]);

  const dismiss = () => { localStorage.setItem(storeKey, "1"); setOpen(false); };
  const closeWelcome = () => { localStorage.setItem(welcomeKey, "1"); setWelcome(false); };
  const settings = isProject ? "/project/settings" : "/dashboard/settings";

  return (
    <>
      {welcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Welcome to RaidFi 👋</h2>
            <p className="text-sm text-muted-foreground">
              {isProject
                ? "RaidFi shows you who really builds your community. Two quick steps to get going:"
                : "RaidFi turns your posts about projects into reputation and XP. Two quick steps to get going:"}
            </p>
            <ol className="space-y-2 text-sm text-foreground list-decimal pl-5">
              <li>Verify your X account</li>
              <li>{isProject ? "Add the bot to your Telegram group and send /connectproject" : "Connect Telegram to submit posts from the bot"}</li>
            </ol>
            <div className="flex gap-2">
              <Link to={settings} onClick={closeWelcome} className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">
                Connect now
              </Link>
              <button onClick={closeWelcome} className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">Later</button>
            </div>
          </div>
        </div>
      )}
      {open && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="flex-1 text-xs text-foreground">{tip}</p>
          <button onClick={dismiss} aria-label="Dismiss tip" className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
};

export default PageTip;
