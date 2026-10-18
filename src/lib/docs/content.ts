// Shared docs content: rendered by /docs and served to AI assistants by the MCP docs tools.
export interface DocPage { slug: string; title: string; section: string; summary: string; body: string }

const API = "https://beta.raidfi.site/api/v1";

export const DOC_SECTIONS = ["Getting started", "Whitepaper", "Developer API", "Build with AI"] as const;

export const DOCS: DocPage[] = [
  {
    slug: "introduction", section: "Getting started", title: "Introduction",
    summary: "What RaidFi is, how it works and how to get started.",
    body: `# Welcome to RaidFi

RaidFi helps Web3 projects see **who genuinely contributes** to their community, and helps contributors turn their work into a **reputation that follows them**.

Instead of counting who posts the most, RaidFi looks at the quality and consistency of what people share about a project.

## How it works in 4 steps

1. **You post** about a project on X — a thread, an explainer, a review, a video.
2. **You submit the link** on RaidFi (website or Telegram bot) and choose the project it is about.
3. **The project reviews it.** Approved posts earn XP. Rejected posts come with notes so you know what to improve.
4. **Your reputation grows.** Every approved submission adds to your reputation score (0–1,000), your tier and your rank on the leaderboard.

## Who is RaidFi for?

| | Contributors | Projects |
|---|---|---|
| **Goal** | Get recognised for real work | Find and reward real supporters |
| **Use** | Submit posts, earn XP, build reputation | Review submissions, award XP, read analytics |
| **Tools** | Dashboard, Telegram bot, RaidCard, AI assistant | Project workspace, AI Analyst, API, AI assistant |

## Quick start

- **Contributor?** Read [For contributors](/docs/contributors).
- **Project?** Read [For projects](/docs/projects).
- **Developer?** Go to the [Developer API](/docs/api-overview) or [Connect an AI assistant](/docs/mcp).
- **Want the full vision?** Read the [Whitepaper](/docs/whitepaper).

## Useful links

- Website: [beta.raidfi.site](https://beta.raidfi.site)
- Request beta access: [beta.raidfi.site/beta](https://beta.raidfi.site/beta)
- Telegram community: [t.me/raidfi_community](https://t.me/raidfi_community)
- X: [@raidfi_app](https://x.com/raidfi_app)
- Email: hello.raidfi@gmail.com`,
  },
  {
    slug: "contributors", section: "Getting started", title: "For contributors",
    summary: "Sign up, connect accounts, submit posts and grow reputation.",
    body: `# For contributors

## 1. Get access
RaidFi is in beta. Request access at **/beta**. You will get a beta code by email (or be accepted instantly when auto-accept is on). A friend can also give you one of their invite codes.

## 2. Sign in
Go to **/login**. Use **Continue with Google** or email and password. New members enter their beta code once — before or right after signing in.

## 3. Connect your accounts
On your first visit a welcome box asks you to connect:
- **X** (Dashboard → Settings) — proves the posts you submit are yours. Unverified accounts can't earn XP.
- **Telegram** — lets you submit and check XP from the bot.

## 4. Submit a post
Press the **+** button, paste your X post link and choose the project it is about (or RaidFi). You will see a preview and a warning if the post isn't from your account.

In Telegram, send \`/submit <link>\` to the bot or in a project's group. The bot asks which project it is about.

## 5. Review & XP
The project approves or rejects your submission. Approved = XP. Rejected = notes on what to improve. You get notified in the bell icon.

## 6. Grow your reputation
- **Reputation page:** your score, tier, rank and your **RaidCard** — a shareable ID card with your top projects. Share it on X or download it.
- **Contributions page:** every submission with its status and notes.
- **Analytics:** your activity over time.

## 7. Invite friends
On **Referrals** you have five one-time invite codes and a referral link. You earn XP when a friend joins. You can also recommend a project.

## Telegram bot commands
- \`/start\` — connect your account
- \`/submit <link>\` — submit a post
- \`/xp\` — check your XP
- \`/tasks\` — see open tasks
- \`/leaderboard\` — top contributors`,
  },
  {
    slug: "projects", section: "Getting started", title: "For projects",
    summary: "Join, manage submissions, analytics and the AI Analyst.",
    body: `# For projects

## 1. Apply
Fill in the project request form at **/project-request**. Once approved, sign in and open your **Project workspace** at **/project**.

## 2. Your workspace
- **Overview** — headline numbers for your community.
- **Contributors** — who submits for you, their XP and reputation.
- **Activity** — the latest submissions.
- **Evaluate** — approve or reject submissions, award XP and leave notes.
- **Analytics** — trends over time.
- **AI Analyst** — ask questions about your community in plain language.
- **Settings** — profile, verification on X, Telegram and Developer API keys.

## 3. Reviewing submissions
Every submission is linked to your project. Approve good work with XP, reject with a short note so the contributor can improve. RaidFi turns approved work into the shared reputation score.

## 4. Connect your Telegram group
1. Add the RaidFi bot to your group as admin.
2. Send \`/connectproject\` in the group (add your project slug if you run more than one).
3. New submissions are announced in your group, and members can submit with \`/submit <link>\`.

## 5. Private partner
Projects can be marked private by RaidFi admins: they don't appear on Explore and their page isn't public.

## 6. Developers & AI
Create API keys in **Settings → Developer API** to build your own dashboard or tools, or connect your AI assistant to review submissions for you. See [Developer API](/docs/api-overview) and [MCP](/docs/mcp).`,
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
  {
    slug: "changelog", section: "Changelog", title: "Changelog",
    summary: "Release history of RaidFi Beta.",
    body: `# Changelog

## v0.3.0-beta — October 18, 2026
**Docs, Developer API & AI assistants**
- **Docs:** one place for guides, the whitepaper, the Developer API and Build with AI.
- **Developer API:** project keys to read reputation, list and review submissions, award XP and read analytics, with rate limits and idempotency.
- **AI assistants (MCP):** connect Claude, ChatGPT or Cursor to submit posts, review submissions, analyze performance and read the docs.
- **Project-linked submissions:** every submission is linked to a project on the site, in Telegram, the API and MCP.
- **RaidCard & composer:** shareable contributor ID card, post preview and instant X verification prompts.
- **Sign-in:** one sign-in and sign-up form with Google, plus referral invite codes.

## v0.2.0-beta — October 1, 2026
**Google sign-up & referral fixes**
- Google sign-up and sign-in.
- Referral links and invite codes now credit the right person.
- Public changelog.

## v0.1.0-beta — September 26, 2026
**Initial beta release**
- Telegram bot for submissions, XP and notifications.
- Social contribution tracking on X.
- Reputation system based on frequency, consistency and depth of contribution.
- Contributor dashboard and project workspace analytics.
- Beta access requests and invite codes.`,
  },
];

export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug);
