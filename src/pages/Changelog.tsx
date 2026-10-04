import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { BASE_URL } from "@/lib/constants";

interface ChangelogEntry {
  date: string;
  version: string;
  title: string;
  changes: {
    label: string;
    description: string;
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    date: "October 1, 2026",
    version: "v0.2.0-beta",
    title: "Google Sign-Up & Referral System Fixes",
    changes: [
      {
        label: "Google Sign-Up",
        description: "Added Google authentication support for faster account creation and login.",
      },
      {
        label: "Referral System",
        description: "Fixed issue where referral links and code tracking were not properly attributing invites.",
      },
      {
        label: "Changelog Page",
        description: "Added public changelog to document platform updates and release history.",
      },
    ],
  },
  {
    date: "September 26, 2026",
    version: "v0.1.0-beta",
    title: "Initial Beta Release",
    changes: [
      {
        label: "Telegram Bot",
        description: "Community contribution tracking, activity logging, and notification bot for Telegram.",
      },
      {
        label: "Social Contribution Tracking",
        description: "Track social activity and voluntary social account connections across Web3 platforms.",
      },
      {
        label: "Reputation System",
        description: "Behavior-based reputation layer measuring contribution frequency, consistency, and depth.",
      },
      {
        label: "Analytics Dashboards",
        description: "Contributor dashboards and project workspace analytics for tracking community signal.",
      },
      {
        label: "Beta Access System",
        description: "Waitlist and beta invite request pipeline.",
      },
    ],
  },
];

const Changelog = () => {
  useSEO({
    title: "Changelog - RaidFi",
    description: "Latest updates and release history for RaidFi Beta.",
    path: "/changelog",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 pt-28 pb-20 max-w-3xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Changelog - RaidFi",
              "description": "Latest updates and release history for RaidFi Beta.",
              "publisher": { "@type": "Organization", "name": "RaidFi" },
              "url": `${BASE_URL}/changelog`,
            }),
          }}
        />

        <header className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5 rounded">
              Beta
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Changelog</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Product updates and improvements for RaidFi Beta.
          </p>
        </header>

        <div className="space-y-12">
          {changelogData.map((entry) => (
            <section key={entry.version} className="border-t border-border pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{entry.title}</h2>
                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                    {entry.version}
                  </span>
                </div>
                <time className="text-xs text-muted-foreground">{entry.date}</time>
              </div>

              <ul className="space-y-3 mt-4">
                {entry.changes.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground font-medium">{item.label}:</strong>{" "}
                    {item.description}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Changelog;
