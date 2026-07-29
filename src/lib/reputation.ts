// RaidFi Reputation Engine (client-side model over contribution data)
// Behavior-based, longitudinal, non-transferable.

export interface ReputationInput {
  contributions: {
    created_at: string;
    status: string;
    points_earned: number;
    manual_score?: number | null;
    ai_score?: number | null;
    content_type?: string | null;
  }[];
  telegramLinked: boolean;
  referralCount: number;
  accountCreatedAt?: string | null;
}

export interface Pillar {
  key: string;
  label: string;
  description: string;
  value: number; // 0-100
  weight: number;
}

export interface ReputationResult {
  score: number; // 0-1000
  tier: ReputationTier;
  pillars: Pillar[];
  activeWeeks: number;
  currentStreakWeeks: number;
  approvalRate: number;
  avgQuality: number;
  approvedCount: number;
  totalCount: number;
}

export interface ReputationTier {
  name: string;
  min: number;
  blurb: string;
}

export const TIERS: ReputationTier[] = [
  { name: "Unverified", min: 0, blurb: "Not enough contribution history to establish a signal." },
  { name: "Emerging", min: 150, blurb: "Early contribution history forming. Consistency is the next step." },
  { name: "Established", min: 350, blurb: "Reliable participation with a measurable contribution record." },
  { name: "Trusted", min: 600, blurb: "Sustained, high-quality contribution across a long window." },
  { name: "Core", min: 820, blurb: "Top-tier behavioral reliability. A proven long-term contributor." },
];

export function tierFor(score: number): ReputationTier {
  return [...TIERS].reverse().find((t) => score >= t.min) ?? TIERS[0];
}

const WEEK = 7 * 24 * 60 * 60 * 1000;

function weekIndex(date: Date, now: Date) {
  return Math.floor((now.getTime() - date.getTime()) / WEEK);
}

export function computeReputation(input: ReputationInput): ReputationResult {
  const now = new Date();
  const all = input.contributions ?? [];
  const approved = all.filter((c) => c.status === "approved");
  const totalCount = all.length;
  const approvedCount = approved.length;

  // --- Consistency: distinct active weeks in the trailing 12-week window
  const windowWeeks = 12;
  const weeks = new Set<number>();
  approved.forEach((c) => {
    const idx = weekIndex(new Date(c.created_at), now);
    if (idx >= 0 && idx < windowWeeks) weeks.add(idx);
  });
  const activeWeeks = weeks.size;
  const consistency = Math.min(100, (activeWeeks / windowWeeks) * 100);

  // Current streak of consecutive active weeks (from this week backwards)
  let currentStreakWeeks = 0;
  for (let i = 0; i < windowWeeks; i++) {
    if (weeks.has(i)) currentStreakWeeks++;
    else if (i > 0) break;
  }

  // --- Quality: average awarded score per approved contribution (20 = ceiling)
  const scores = approved.map((c) => c.manual_score ?? c.ai_score ?? c.points_earned ?? 0);
  const avgQuality = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const quality = Math.min(100, (avgQuality / 20) * 100);

  // --- Reliability: share of submissions that pass review
  const approvalRate = totalCount ? approvedCount / totalCount : 0;
  const reliability = totalCount < 3 ? approvalRate * 60 : approvalRate * 100;

  // --- Depth: log-scaled contribution volume (diminishing returns, anti-spam)
  const depth = Math.min(100, (Math.log10(approvedCount + 1) / Math.log10(41)) * 100);

  // --- Footprint: cross-platform presence + network contribution
  const footprint = Math.min(
    100,
    (input.telegramLinked ? 45 : 0) +
      Math.min(35, input.referralCount * 7) +
      (new Set(approved.map((c) => c.content_type).filter(Boolean)).size >= 2 ? 20 : 0)
  );

  const pillars: Pillar[] = [
    {
      key: "consistency",
      label: "Consistency",
      description: "Active weeks across the trailing 12-week window.",
      value: consistency,
      weight: 0.3,
    },
    {
      key: "quality",
      label: "Engagement Quality",
      description: "Average reviewed score per accepted contribution.",
      value: quality,
      weight: 0.25,
    },
    {
      key: "reliability",
      label: "Behavioral Reliability",
      description: "Share of submissions that pass review.",
      value: reliability,
      weight: 0.2,
    },
    {
      key: "depth",
      label: "Contribution Depth",
      description: "Volume of accepted work, log-scaled to resist spam.",
      value: depth,
      weight: 0.15,
    },
    {
      key: "footprint",
      label: "Cross-Platform Footprint",
      description: "Presence and contribution beyond a single surface.",
      value: footprint,
      weight: 0.1,
    },
  ];

  const score = Math.round(
    pillars.reduce((acc, p) => acc + p.value * p.weight, 0) * 10
  );

  return {
    score,
    tier: tierFor(score),
    pillars,
    activeWeeks,
    currentStreakWeeks,
    approvalRate,
    avgQuality,
    approvedCount,
    totalCount,
  };
}

/** Weekly buckets for trend charts. */
export function weeklySeries(
  contributions: { created_at: string; status: string; points_earned: number }[],
  weeksBack = 12
) {
  const now = new Date();
  const buckets = Array.from({ length: weeksBack }, (_, i) => ({
    label: i === 0 ? "This wk" : `-${i}w`,
    index: weeksBack - 1 - i,
    contributions: 0,
    xp: 0,
  })).reverse();

  contributions.forEach((c) => {
    const idx = weekIndex(new Date(c.created_at), now);
    if (idx < 0 || idx >= weeksBack) return;
    const bucket = buckets[weeksBack - 1 - idx];
    if (!bucket) return;
    bucket.contributions += 1;
    if (c.status === "approved") bucket.xp += c.points_earned ?? 0;
  });

  return buckets;
}
