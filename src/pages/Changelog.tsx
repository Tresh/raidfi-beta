import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { BASE_URL } from "@/lib/constants";
import { Sparkles, Bug, Rocket, CheckCircle2 } from "lucide-react";

interface ChangelogItem {
  type: "feature" | "fix" | "improvement";
  title: string;
  description: string;
}

interface ChangelogRelease {
  version: string;
  date: string;
  title: string;
  badgeText?: string;
  isLatest?: boolean;
  highlights: ChangelogItem[];
}

const releases: ChangelogRelease[] = [
  {
    version: "v0.2.0-beta",
    date: "01 Oct 2026",
    title: "Google Signup, Referral Fixes & Changelog",
    badgeText: "Latest Update",
    isLatest: true,
    highlights: [
      {
        type: "feature",
        title: "Google Sign-Up Integration",
        description: "Users can now sign up and log in seamlessly using Google authentication.",
      },
      {
        type: "fix",
        title: "Referral System Fixes",
        description: "Resolved issues with referral code tracking and invite attribution to ensure smooth user onboarding.",
      },
      {
        type: "feature",
        title: "Changelog Page",
        description: "Added a dedicated public changelog page to keep users informed on platform updates and progress.",
      },
    ],
  },
  {
    version: "v0.1.0-beta",
    date: "26 Sept 2026",
    title: "Initial Beta Launch",
    badgeText: "Initial Beta",
    isLatest: false,
    highlights: [
      {
        type: "feature",
        title: "Telegram Bot Integration",
        description: "Automated community raids, real-time activity tracking, and notification bot for Telegram.",
      },
      {
        type: "feature",
        title: "Social Contribution Tracking",
        description: "Track social contribution signals and link social identities across Web3 platforms.",
      },
      {
        type: "feature",
        title: "Reputation Layer & Longitudinal Scoring",
        description: "Behavior-based reputation system designed to measure engagement depth, consistency, and noise reduction.",
      },
      {
        type: "feature",
        title: "Contributor & Project Dashboards",
        description: "Analytics dashboards for contributors to track reputation and for projects to evaluate community activity.",
      },
      {
        type: "feature",
        title: "Beta Access Request System",
        description: "Waitlist, beta access request flow, and streamlined user onboarding.",
      },
    ],
  },
];

const Changelog = () => {
  useSEO({
    title: "Changelog - RaidFi Beta",
    description: "Track the latest updates, fixes, and feature releases for RaidFi Beta.",
    path: "/changelog",
  });

  const getIcon = (type: ChangelogItem["type"]) => {
    switch (type) {
      case "feature":
        return <Sparkles className="w-4 h-4 text-primary" />;
      case "fix":
        return <Bug className="w-4 h-4 text-amber-400" />;
      case "improvement":
        return <Rocket className="w-4 h-4 text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
    }
  };

  const getBadgeVariant = (type: ChangelogItem["type"]) => {
    switch (type) {
      case "feature":
        return "bg-primary/10 text-primary border-primary/20";
      case "fix":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "improvement":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 pt-28 pb-20 max-w-4xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Changelog - RaidFi Beta",
              "description": "Product updates and changelog for RaidFi Beta.",
              "publisher": { "@type": "Organization", "name": "RaidFi" },
              "url": `${BASE_URL}/changelog`,
            }),
          }}
        />

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            RaidFi is currently in Beta
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Product <span className="text-gradient">Changelog</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Follow our progress as we build the contribution intelligence & reputation infrastructure for Web3.
          </p>
        </div>

        {/* Releases Timeline */}
        <div className="relative border-l border-border/60 ml-4 md:ml-32 pl-6 md:pl-10 space-y-12">
          {releases.map((release) => (
            <div key={release.version} className="relative group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 transition-colors ${
                  release.isLatest
                    ? "border-primary bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]"
                    : "border-muted-foreground/40 bg-background"
                }`}
              />

              {/* Release Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border">
                      {release.version}
                    </span>
                    {release.badgeText && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                        {release.badgeText}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-2">{release.title}</h2>
                </div>

                {/* Date positioned to left on desktop, inline on mobile */}
                <div className="md:absolute md:-left-36 md:top-2 text-xs font-medium text-muted-foreground">
                  <time>{release.date}</time>
                </div>
              </div>

              {/* Release Card */}
              <div className="glass-card rounded-xl p-6 border border-border/80 bg-card/60 space-y-4">
                {release.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="p-1.5 rounded-lg bg-secondary/80 border border-border/50 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{item.title}</span>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded border ${getBadgeVariant(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Changelog;
