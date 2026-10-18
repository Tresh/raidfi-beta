// Shared docs content: rendered by /docs and served to AI assistants by the MCP docs tools.
export interface DocPage { slug: string; title: string; section: string; summary: string; body: string }

const API = "https://beta.raidfi.site/api/v1";

export const DOC_SECTIONS = ["Getting started", "Whitepaper", "Developer API", "Build with AI"] as const;

export const DOCS: DocPage[] = [
  {
    slug: "introduction", section: "Getting started", title: "Introduction",
    summary: "What RaidFi is and who it is for.",
    body: `# Introduction

RaidFi is a contribution intelligence and reputation layer for Web3 communities.

- **Contributors** submit the X posts they publish about projects, earn XP when submissions are approved and build a portable reputation score.
- **Projects** see who genuinely supports them, review submissions, award XP and read analytics.

Every submission is linked to a **project** (or to RaidFi itself), so projects only see the work done for them.`,
  },
  {
    slug: "contributors", section: "Getting started", title: "For contributors",
    summary: "Sign up, connect accounts, submit posts and grow reputation.",
    body: `# For contributors

1. **Sign up** at beta.raidfi.site/login with Google or email. New members enter a beta code (or are accepted automatically when auto-accept is on).
2. **Connect X** in Dashboard → Settings so we can confirm your posts are yours.
3. **Connect Telegram** to submit from the bot with \`/submit <link>\`.
4. **Submit a post** with the + button. Pick the project the post is about.
5. **Get reviewed**. Approved posts earn XP; rejected posts include notes on what to improve.
6. **Share your RaidCard** from the Reputation page.
7. **Invite friends** with your five one-time codes on the Referrals page.`,
  },
  {
    slug: "projects", section: "Getting started", title: "For projects",
    summary: "Join, manage submissions, analytics and the AI Analyst.",
    body: `# For projects

1. **Request access** through the project request form.
2. **Project workspace** (/project): overview, contributors, activity, evaluation, analytics and the AI Analyst.
3. **Review submissions**: approve or reject, award XP and leave notes.
4. **Telegram**: add the bot to your group and send \`/connectproject\` to post new submissions there.
5. **Developer API & AI**: create API keys in Project Settings → Developer API, or connect your AI assistant through MCP.`,
  },
  {
    slug: "submissions", section: "Getting started", title: "Submissions & projects",
    summary: "How a submission is linked to a project.",
    body: `# Submissions & projects

Each submission carries a \`project_id\`. Contributors choose the project on the website, in the Telegram bot, through the API or through MCP. Posts made in a connected project's Telegram group are linked to that project automatically. Submissions without a project belong to RaidFi.

Projects can only list, review and read analytics for their own submissions.`,
  },
  {
    slug: "whitepaper", section: "Whitepaper", title: "Whitepaper",
    summary: "The live RaidFi whitepaper.",
    body: "", // loaded live from the whitepaper editor
  },
  {
    slug: "api-overview", section: "Developer API", title: "Overview & authentication",
    summary: "Base URL, keys, scopes, limits and idempotency.",
    body: `# Developer API

**Base URL:** \`${API}\`

## Authentication
Send your project key in \`x-api-key: rf_live_...\` or \`Authorization: Bearer rf_live_...\`. Create and revoke keys in Project Settings → Developer API.

## Scopes
- **Reputation only** — read reputation and leaderboard.
- **Full access** — also list, submit and review your project's submissions and read metrics.

## Limits
Read and write requests are rate limited per key. A limited request returns \`429\`.

## Idempotency
Send \`Idempotency-Key: <unique>\` on POST requests. Retrying with the same key returns the original result instead of creating a duplicate.

## Errors
JSON \`{ "error": "message" }\` with status 400, 401, 403, 404 or 429.`,
  },
  {
    slug: "api-reputation", section: "Developer API", title: "Reputation",
    summary: "Read a contributor's reputation and the leaderboard.",
    body: `# Reputation

RaidFi owns the scoring model; every project reads the same score.

\`\`\`bash
curl ${API}/reputation/<x_handle> -H "x-api-key: rf_live_..."
curl -X POST ${API}/reputation/batch -H "x-api-key: rf_live_..." \\
  -H "Content-Type: application/json" -d '{"handles":["alice","bob"]}'
curl "${API}/leaderboard?period=week" -H "x-api-key: rf_live_..."
\`\`\``,
  },
  {
    slug: "api-contributions", section: "Developer API", title: "Submissions",
    summary: "List, submit, approve and reject your project's submissions.",
    body: `# Submissions (full access)

\`\`\`bash
# List (filter by status: pending, approved, rejected)
curl "${API}/contributions?status=pending" -H "x-api-key: rf_live_..."

# Approve with XP, score and notes
curl -X POST ${API}/contributions/<id>/verify -H "x-api-key: rf_live_..." \\
  -H "Content-Type: application/json" -H "Idempotency-Key: review-123" \\
  -d '{"status":"approved","points":50,"score":80,"notes":"Clear breakdown"}'

# Reject with feedback
curl -X POST ${API}/contributions/<id>/verify -H "x-api-key: rf_live_..." \\
  -H "Content-Type: application/json" -d '{"status":"rejected","notes":"Off-topic"}'
\`\`\`

Points are clamped to 0–1000 and score to 0–100. Submissions are always linked to the key's project.`,
  },
  {
    slug: "api-metrics", section: "Developer API", title: "Analytics",
    summary: "30-day project metrics.",
    body: `# Analytics

\`\`\`bash
curl ${API}/metrics -H "x-api-key: rf_live_..."
\`\`\`

Returns submission counts by status, active contributors and XP awarded over the last 30 days. Usage of your keys (volume, errors, limits) is shown in Project Settings.`,
  },
  {
    slug: "mcp", section: "Build with AI", title: "Connect an AI assistant (MCP)",
    summary: "Use RaidFi from Claude, ChatGPT, Cursor and other MCP clients.",
    body: `# Connect an AI assistant (MCP)

**Server URL:** \`https://beta.raidfi.site/mcp\`

Add it as a custom connector in your AI client and sign in with your RaidFi account.

## Contributor tools
- \`get_my_profile\`, \`list_my_contributions\` (with review notes), \`submit_contribution\` (choose a project), \`analyze_my_performance\`, \`get_leaderboard\`.

## Project tools (pass your rf_live_ key)
- \`get_project_analytics\`, \`list_project_contributions\`, \`review_contribution\` (approve/reject with XP and notes), \`get_contributor_reputation\`.

## Docs tools
- \`list_docs\` and \`read_doc\` let your assistant read these docs, including the whitepaper.

Example prompt: *"List my pending submissions and approve the ones that explain our product clearly with 40 XP."*`,
  },
  {
    slug: "build-with-ai", section: "Build with AI", title: "Build with AI",
    summary: "Ideas for agents and apps built on RaidFi.",
    body: `# Build with AI

- **Review agent** — an assistant that reads pending submissions, scores them against your guidelines and approves or rejects with notes.
- **Community dashboard** — your own admin view built on the Submissions and Analytics endpoints.
- **Reputation gate** — check a wallet holder's X handle reputation before allowlists or roles.
- **Coach** — contributors ask their assistant what to improve based on past review notes.

Point your coding assistant at the MCP server so it can read these docs while it builds.`,
  },
];

export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug);
