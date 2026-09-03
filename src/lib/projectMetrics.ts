// Shared field catalogue + filter/rank/formula engine for the Project workspace.
// Every field here maps to data the backend actually returns from
// public.project_contributor_analytics - nothing is invented.

export interface ContributorRow {
  email: string;
  display_name: string;
  x_username: string | null;
  referral_code: string | null;
  total_xp: number;
  contributions: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptance_rate: number | null;
  avg_quality: number | null;
  max_quality: number | null;
  xp_earned: number;
  first_contribution: string | null;
  last_contribution: string | null;
  active_days: number;
  active_weeks: number;
  project_contributions: number;
  project_accepted: number;
  project_xp: number;
  project_last: string | null;
  ai_generated_count: number;
  // derived (computed client-side from the above)
  reputation?: number;
  consistency?: number;
  quality?: number;
  reliability?: number;
  depth?: number;
  footprint?: number;
  days_since_last?: number | null;
  tier?: string;
  worked_with_project?: boolean;
  [key: string]: unknown;
}

export const TIER_ORDER = ["Unverified", "Emerging", "Established", "Trusted", "Core"] as const;

export function tierName(score: number) {
  if (score >= 820) return "Core";
  if (score >= 600) return "Trusted";
  if (score >= 350) return "Established";
  if (score >= 150) return "Emerging";
  return "Unverified";
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Derive the five reputation pillars from aggregate rows using the same model
 * as src/lib/reputation.ts (single source of truth for the weighting).
 */
export function deriveMetrics(row: ContributorRow, windowWeeks: number): ContributorRow {
  const weeks = Math.max(1, windowWeeks);
  const consistency = clamp((row.active_weeks / weeks) * 100);
  const quality = clamp(((row.avg_quality ?? 0) / 20) * 100);
  const rate = (row.acceptance_rate ?? 0) / 100;
  const reliability = row.contributions < 3 ? clamp(rate * 60) : clamp(rate * 100);
  const depth = clamp((Math.log10(row.accepted + 1) / Math.log10(41)) * 100);
  const footprint = clamp((row.x_username ? 45 : 0) + Math.min(35, row.active_days * 2) + (row.project_contributions > 0 ? 20 : 0));

  const reputation = Math.round(
    (consistency * 0.3 + quality * 0.25 + reliability * 0.2 + depth * 0.15 + footprint * 0.1) * 10,
  );

  const last = row.last_contribution ? new Date(row.last_contribution).getTime() : null;
  const days_since_last = last ? Math.floor((Date.now() - last) / 86_400_000) : null;

  return {
    ...row,
    consistency: Math.round(consistency),
    quality: Math.round(quality),
    reliability: Math.round(reliability),
    depth: Math.round(depth),
    footprint: Math.round(footprint),
    reputation,
    tier: tierName(reputation),
    days_since_last,
    worked_with_project: row.project_contributions > 0,
  };
}

export type FieldType = "number" | "percent" | "text" | "date" | "boolean";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  group: string;
  help?: string;
  pinnable?: boolean;
}

export const FIELDS: FieldDef[] = [
  { key: "display_name", label: "Contributor", type: "text", group: "Identity" },
  { key: "x_username", label: "X username", type: "text", group: "Identity" },
  { key: "tier", label: "Tier", type: "text", group: "Reputation" },
  { key: "reputation", label: "Reputation", type: "number", group: "Reputation", help: "0–1000 composite of the five pillars." },
  { key: "consistency", label: "Consistency", type: "number", group: "Reputation", help: "Share of weeks in the period with activity." },
  { key: "quality", label: "Quality", type: "number", group: "Reputation", help: "Average reviewed score, normalised to 100." },
  { key: "reliability", label: "Reliability", type: "number", group: "Reputation", help: "Share of submissions that pass review." },
  { key: "depth", label: "Depth", type: "number", group: "Reputation", help: "Accepted volume, log-scaled to resist spam." },
  { key: "footprint", label: "Footprint", type: "number", group: "Reputation", help: "Verified X handle, spread of active days, project history." },
  { key: "total_xp", label: "Total XP", type: "number", group: "Volume" },
  { key: "contributions", label: "Contributions", type: "number", group: "Volume" },
  { key: "accepted", label: "Accepted", type: "number", group: "Volume" },
  { key: "rejected", label: "Rejected", type: "number", group: "Volume" },
  { key: "pending", label: "Pending", type: "number", group: "Volume" },
  { key: "acceptance_rate", label: "Acceptance rate", type: "percent", group: "Volume" },
  { key: "avg_quality", label: "Avg score", type: "number", group: "Volume" },
  { key: "max_quality", label: "Top score", type: "number", group: "Volume" },
  { key: "xp_earned", label: "XP in period", type: "number", group: "Volume" },
  { key: "active_days", label: "Active days", type: "number", group: "Activity" },
  { key: "active_weeks", label: "Active weeks", type: "number", group: "Activity" },
  { key: "days_since_last", label: "Days since last", type: "number", group: "Activity" },
  { key: "first_contribution", label: "First contribution", type: "date", group: "Activity" },
  { key: "last_contribution", label: "Last contribution", type: "date", group: "Activity" },
  { key: "ai_generated_count", label: "AI-assisted posts", type: "number", group: "Activity" },
  { key: "project_contributions", label: "Posts about us", type: "number", group: "Relationship" },
  { key: "project_accepted", label: "Accepted about us", type: "number", group: "Relationship" },
  { key: "project_xp", label: "XP from our posts", type: "number", group: "Relationship" },
  { key: "project_last", label: "Last post about us", type: "date", group: "Relationship" },
  { key: "worked_with_project", label: "Worked with us", type: "boolean", group: "Relationship" },
];

export const FIELD_MAP = Object.fromEntries(FIELDS.map((f) => [f.key, f]));

export const DEFAULT_COLUMNS = [
  "display_name",
  "x_username",
  "reputation",
  "tier",
  "quality",
  "consistency",
  "reliability",
  "contributions",
  "acceptance_rate",
  "days_since_last",
  "project_contributions",
];

/* ---------------------------------- filters --------------------------------- */

export type Operator = "gte" | "lte" | "eq" | "neq" | "contains" | "is_true" | "is_false";

export interface Filter {
  id: string;
  field: string;
  op: Operator;
  value: string;
}

export const OPERATORS: Record<FieldType, { value: Operator; label: string }[]> = {
  number: [
    { value: "gte", label: "at least" },
    { value: "lte", label: "at most" },
    { value: "eq", label: "equals" },
  ],
  percent: [
    { value: "gte", label: "at least" },
    { value: "lte", label: "at most" },
  ],
  text: [
    { value: "contains", label: "contains" },
    { value: "eq", label: "is" },
    { value: "neq", label: "is not" },
  ],
  date: [
    { value: "gte", label: "on or after" },
    { value: "lte", label: "on or before" },
  ],
  boolean: [
    { value: "is_true", label: "yes" },
    { value: "is_false", label: "no" },
  ],
};

export function applyFilters(rows: ContributorRow[], filters: Filter[]): ContributorRow[] {
  if (!filters.length) return rows;
  return rows.filter((row) =>
    filters.every((f) => {
      const def = FIELD_MAP[f.field];
      const raw = row[f.field];
      if (!def) return true;
      if (f.op === "is_true") return Boolean(raw);
      if (f.op === "is_false") return !raw;
      if (def.type === "text") {
        const s = String(raw ?? "").toLowerCase();
        const v = f.value.trim().toLowerCase();
        if (!v) return true;
        if (f.op === "contains") return s.includes(v);
        if (f.op === "eq") return s === v;
        if (f.op === "neq") return s !== v;
      }
      if (def.type === "date") {
        if (!raw || !f.value) return !f.value;
        const a = new Date(String(raw)).getTime();
        const b = new Date(f.value).getTime();
        return f.op === "gte" ? a >= b : a <= b;
      }
      const n = Number(raw ?? 0);
      const v = Number(f.value);
      if (!Number.isFinite(v)) return true;
      if (f.op === "gte") return n >= v;
      if (f.op === "lte") return n <= v;
      if (f.op === "eq") return n === v;
      return true;
    }),
  );
}

/* --------------------------------- objectives -------------------------------- */

export interface Objective {
  key: string;
  label: string;
  blurb: string;
  weights: Record<string, number>;
  filters?: Omit<Filter, "id">[];
}

export const OBJECTIVES: Objective[] = [
  {
    key: "balanced",
    label: "Balanced",
    blurb: "Overall reputation with no single pillar favoured.",
    weights: { reputation: 1 },
  },
  {
    key: "ambassadors",
    label: "Ambassadors",
    blurb: "Long-running, dependable people who show up week after week.",
    weights: { consistency: 0.35, reliability: 0.25, depth: 0.2, footprint: 0.1, quality: 0.1 },
    filters: [{ field: "active_weeks", op: "gte", value: "4" }],
  },
  {
    key: "launch",
    label: "Launch push",
    blurb: "People posting right now with good recent quality.",
    weights: { quality: 0.4, consistency: 0.2, reliability: 0.2, footprint: 0.2 },
    filters: [{ field: "days_since_last", op: "lte", value: "14" }],
  },
  {
    key: "educators",
    label: "Educators",
    blurb: "Depth and quality over raw volume - threads and explainers.",
    weights: { depth: 0.35, quality: 0.35, consistency: 0.2, reliability: 0.1 },
  },
  {
    key: "reactivate",
    label: "Win back",
    blurb: "Strong contributors who have gone quiet.",
    weights: { reputation: 0.6, depth: 0.4 },
    filters: [
      { field: "days_since_last", op: "gte", value: "21" },
      { field: "accepted", op: "gte", value: "3" },
    ],
  },
  {
    key: "loyal",
    label: "Already ours",
    blurb: "People who have already posted about this project.",
    weights: { project_contributions: 0.4, quality: 0.3, consistency: 0.3 },
    filters: [{ field: "project_contributions", op: "gte", value: "1" }],
  },
];

export function scoreForObjective(row: ContributorRow, obj: Objective): number {
  let total = 0;
  let weight = 0;
  for (const [key, w] of Object.entries(obj.weights)) {
    const def = FIELD_MAP[key];
    let v = Number(row[key] ?? 0);
    if (key === "reputation") v = v / 10; // normalise 0-1000 to 0-100
    if (def?.type === "number" && key === "project_contributions") v = Math.min(100, v * 12);
    total += v * w;
    weight += w;
  }
  return weight ? total / weight : 0;
}

/** Human explanation for why a contributor matched. */
export function explainMatch(row: ContributorRow, obj: Objective): string {
  const bits: string[] = [];
  if ((row.consistency ?? 0) >= 60) bits.push(`active in ${row.active_weeks} separate weeks`);
  if ((row.quality ?? 0) >= 60) bits.push(`average reviewed score of ${(row.avg_quality ?? 0).toFixed(1)}`);
  if ((row.acceptance_rate ?? 0) >= 70) bits.push(`${Math.round(row.acceptance_rate ?? 0)}% of posts accepted`);
  if ((row.days_since_last ?? 999) <= 14) bits.push(`posted ${row.days_since_last} day${row.days_since_last === 1 ? "" : "s"} ago`);
  if (row.project_contributions > 0) bits.push(`${row.project_contributions} post${row.project_contributions === 1 ? "" : "s"} already about you`);
  if (row.x_username) bits.push(`verified X account @${row.x_username}`);
  if (!bits.length) bits.push(`${row.accepted} accepted contribution${row.accepted === 1 ? "" : "s"} in this period`);
  return `Matched "${obj.label}": ` + bits.slice(0, 4).join(", ") + ".";
}

/* --------------------------------- formulas --------------------------------- */

const FN: Record<string, (...a: number[]) => number> = {
  min: Math.min,
  max: Math.max,
  round: (n: number, d = 0) => Number(n.toFixed(d)),
  abs: Math.abs,
  sqrt: Math.sqrt,
};

/**
 * Tiny, safe expression evaluator: numbers, field names, + - * / ( ) and a
 * short whitelist of functions. No JS eval, no property access, no globals.
 */
export function evalFormula(expr: string, row: ContributorRow): number | null {
  const tokens = expr.match(/[A-Za-z_][A-Za-z0-9_]*|\d+\.?\d*|[+\-*/(),]/g);
  if (!tokens) return null;
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  const parseExpr = (): number => {
    let v = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const r = parseTerm();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };
  const parseTerm = (): number => {
    let v = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const r = parseFactor();
      v = op === "*" ? v * r : r === 0 ? 0 : v / r;
    }
    return v;
  };
  const parseFactor = (): number => {
    const t = next();
    if (t === undefined) throw new Error("unexpected end");
    if (t === "-") return -parseFactor();
    if (t === "(") {
      const v = parseExpr();
      if (next() !== ")") throw new Error("missing )");
      return v;
    }
    if (/^\d/.test(t)) return Number(t);
    if (/^[A-Za-z_]/.test(t)) {
      const name = t.toLowerCase();
      if (peek() === "(") {
        next();
        const args: number[] = [];
        if (peek() !== ")") {
          args.push(parseExpr());
          while (peek() === ",") {
            next();
            args.push(parseExpr());
          }
        }
        if (next() !== ")") throw new Error("missing )");
        const fn = FN[name];
        if (!fn) throw new Error("unknown function");
        return fn(...args);
      }
      const v = row[name];
      return Number(v ?? 0);
    }
    throw new Error("bad token");
  };

  try {
    const out = parseExpr();
    if (i !== tokens.length) return null;
    return Number.isFinite(out) ? out : null;
  } catch {
    return null;
  }
}

/* ------------------------ natural language → filters ------------------------ */

export function parseNaturalQuery(input: string): { filters: Omit<Filter, "id">[]; note: string[] } {
  const q = input.toLowerCase();
  const filters: Omit<Filter, "id">[] = [];
  const note: string[] = [];

  const grab = (patterns: RegExp[]) => {
    for (const p of patterns) {
      const m = q.match(p);
      if (m) return Number(m[1]);
    }
    return null;
  };

  const rep = grab([/reputation (?:above|over|greater than|>|at least|min(?:imum)?)\s*(\d+)/]);
  if (rep != null) { filters.push({ field: "reputation", op: "gte", value: String(rep) }); note.push(`Reputation ≥ ${rep}`); }

  const qual = grab([/quality (?:above|over|>|at least|min(?:imum)?)\s*(\d+)/]);
  if (qual != null) { filters.push({ field: "quality", op: "gte", value: String(qual) }); note.push(`Quality ≥ ${qual}`); }

  const cons = grab([/consistency (?:above|over|>|at least|min(?:imum)?)\s*(\d+)/]);
  if (cons != null) { filters.push({ field: "consistency", op: "gte", value: String(cons) }); note.push(`Consistency ≥ ${cons}`); }

  const rel = grab([/reliability (?:above|over|>|at least|min(?:imum)?)\s*(\d+)/]);
  if (rel != null) { filters.push({ field: "reliability", op: "gte", value: String(rel) }); note.push(`Reliability ≥ ${rel}`); }

  const days = grab([/(?:active|posted).{0,20}?(?:last|past)\s*(\d+)\s*days?/, /within (?:the )?(?:last )?(\d+)\s*days?/]);
  if (days != null) { filters.push({ field: "days_since_last", op: "lte", value: String(days) }); note.push(`Active within ${days} days`); }

  const contrib = grab([/(\d+)\+?\s*(?:or more )?contributions?/, /at least (\d+) posts?/]);
  if (contrib != null) { filters.push({ field: "contributions", op: "gte", value: String(contrib) }); note.push(`At least ${contrib} contributions`); }

  const accRate = grab([/acceptance rate (?:above|over|>|at least)\s*(\d+)/]);
  if (accRate != null) { filters.push({ field: "acceptance_rate", op: "gte", value: String(accRate) }); note.push(`Acceptance rate ≥ ${accRate}%`); }

  if (/(inactive|gone quiet|stopped|dormant)/.test(q)) {
    filters.push({ field: "days_since_last", op: "gte", value: "21" });
    note.push("Inactive for 21+ days");
  }
  if (/(posted about us|our contributors|worked with us|already ours)/.test(q)) {
    filters.push({ field: "project_contributions", op: "gte", value: "1" });
    note.push("Has posted about this project");
  }
  if (/\bx\b|twitter|verified handle/.test(q)) {
    filters.push({ field: "x_username", op: "neq", value: "" });
    note.push("Has a verified X handle");
  }

  return { filters, note };
}

/* --------------------------------- exporting -------------------------------- */

export function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const head = columns.map((c) => FIELD_MAP[c]?.label ?? c).join(",");
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [head, ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n");
}

export function formatValue(value: unknown, type: FieldType): string {
  if (value == null || value === "") return "-";
  if (type === "percent") return `${Number(value).toFixed(0)}%`;
  if (type === "date") return new Date(String(value)).toLocaleDateString();
  if (type === "boolean") return value ? "Yes" : "No";
  if (type === "number") return Number(value).toLocaleString();
  return String(value);
}
