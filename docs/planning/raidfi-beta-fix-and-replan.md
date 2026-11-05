# RaidFi Beta: Fix and Replan (Builder Brief)

Date: 2 November 2026
Written by: Raven (RaidFi lead). Approved decisions belong to the founder, Tresh.
Read by: the building AI. You are the builder. This document tells you what to build, in what order, and when each step is done.
Next document: the reputation spec (raidfi-reputation-spec-v1.3.md). You get it at Step 4, not before.

---

## 0. Ground rules

1. Do the steps in order. Do not start a step until the previous one passes its checks.
2. No new features. If something is not in this brief or the reputation spec, stop and ask.
3. Logic lives in `/core`. Product and infra call `/core`. Never copy scoring or submission logic into another folder.
4. A step is done only when every check under it passes. Report the result of each check.
5. Stop and ask the founder before: deleting user data, rotating any live secret, anything that spends money, any public text, any legal item, and any scoring rule not written in the spec.
6. Do not write these words in product, docs or copy: on-chain, portable, Sybil resistant, audited, AI-verified, manipulation-resistant, accurate, fair.
7. Do not invent numbers, users, partners or results.

---

## 1. Locked decisions

These are settled. Do not reopen them.

**Platform and products**
- RaidFi is the platform. It is made of `core` (shared rules) and `infra` (Developer API, MCP).
- The first product is Swipht. It is the social app (contributor dashboard, project workspace, admin, Telegram submission). It runs under its own subdomain (proposed: swipht.raidfi.site, to be confirmed).
- More products can be added later under `products/`. Every product calls `core` and `infra`. No product copies logic.

**Platforms**
- X is the only tracked source. It feeds analytics and reputation. It never triggers rewards.
- Telegram and Discord are submission channels only. We do not track activity inside them.
- Farcaster is out for beta.

**Reputation**
- Reputation belongs to a RaidFi user. X is the first linked account and the proof source for posts.
- The score is built from the reviewer's rating, not from XP.
- Full detail is in the reputation spec (Step 4).

**XP**
- Each accepted submission earns XP by its rating level: 1 = 5, 2 = 7, 3 = 10 (default), 4 = 13, 5 = 15.
- XP never feeds reputation.
- XP that comes from X activity cannot be redeemed for anything. No redemption feature is built for it.

**Review**
- Each project sets a standing review owner: Self or RaidFi in V1. AI comes later through the project's own agent (MCP) or its own key (BYOK).
- One owner per submission. No double review.
- Review queue shows 50 items per batch.

**Calibration (AI switch)**
- The first 50 items: the AI rates each one with a reason, and the approver (RaidFi by default, or the project) approves or changes it.
- Agreement = share of the 50 AI ratings approved without change.
- At 80% or more, the AI decides on its own from item 51.
- Any later change of AI needs 20 items under the same rule.

**Inactive and dormant**
- Inactive: 30 days with no accepted work. Cleared by one accepted submission.
- Dormant: 90 days with no accepted work. Returned by 3 accepted submissions within 30 days.

**Flags and slashes**
- Anyone can flag. A flag changes nothing on its own.
- AI never applies a slash. AI can recommend a slash to a human if the current data confirms the flag.
- No bans in V1.
- Flags and slashes are built last and only after Legal and founder sign-off (Step 8).

---

## 2. Fix list (bugs and standards)

Reputation-related issues are not listed here. They are handled by the reputation spec in Step 4.

### P0: do first

| # | Fix | Done when |
|---|---|---|
| F1 | MCP `submit_contribution` inserts directly into the database. Route it through the shared submission function in `/core`. | A post the caller does not own is rejected through MCP. A test covers it. |
| F2 | Production may show a blank page. Smoke test: home, sign-in, dashboard, project workspace, docs, `/api/v1`, `/mcp`. | Pass/fail list for each page is filed. Any failure is fixed or logged for the founder. |
| F3 | `.env` was committed (commit "Create .env") and is not in `.gitignore`. Check `git log --all -- .env`. Rotate any real secret found. Add `.env` to `.gitignore`. Add `.env.example` with empty values. | Git check result filed (no secret values in the report). Founder confirms any rotation. |
| F4 | Remove unbuilt claims from site, docs and copy (see the banned words list in Section 0). | Search for banned words returns nothing. Social & Content signs off. |

### P1: after P0

| # | Fix | Done when |
|---|---|---|
| F5 | API docs show `POST /contributions/:id/verify`. The handler uses `PATCH`. Update the docs to `PATCH`. | Docs match the handler. |
| F6 | Batch reputation docs use `handles`. Handler reads `identifiers`. Accept both for one release, document `identifiers`, then remove `handles`. | Both names work now. Docs show `identifiers`. |
| F7 | Idempotency docs mention only POST. The handler also covers PATCH. List idempotent methods per endpoint. | Docs list each endpoint and its method. |
| F8 | MCP review idempotency key uses only contribution ID and decision. A corrected re-review replays the old result. Add score and notes to the key, or add an explicit re-review action. | A corrected re-review returns the new result. Test covers it. |
| F9 | API docs say every project reads the same score. That is not true yet. Change the line to: "API reputation is a separate metric until the new score ships." | Docs are accurate. |
| F10 | AI Analyst stores the provider key and chat history in browser local storage. Keep the key in session memory only. Add a "clear key" button. Tell users where data goes. | Key is not in local storage. Clear button works. Disclosure is visible. |
| F11 | Percent change with a zero baseline shows a misleading number. Show "n/a". | Zero baseline shows n/a. |
| F12 | Rename "share of voice" to "share of tracked activity" everywhere. | No "share of voice" left in product or docs. |
| F13 | API "unique contributors" counts unique emails. Label it "unique emails" in docs. | Docs label the metric correctly. |
| F14 | Docs say five one-time invite codes per contributor. Confirm the live setting. Update docs to match. | Docs match live config. Founder confirms the number. |
| F15 | Test Telegram project-group notifications in production: webhook, group permissions, one real notification. | Test result filed. |
| F16 | Use "Request Beta Access" everywhere. Remove "Join the Waitlist". | Wording is consistent. |

---

## 3. Steps

Each step lists what to build, the checks, and when it is done.

### Step 1: Restructure the repo into `core`, `infra`, `products/swipht`

**Decision:** one monorepo. `core` and `infra` are platform folders. Each product sits in `products/`. Not separate repos.

**Layout**

```
/core                 shared RaidFi rules: scoring, XP, rating, review owner,
                      calibration, flags, slashes, tier gates, submission
                      validation, identity linking, shared types.
                      No UI. No HTTP routes.
/infra                RaidFi platform surface: Developer API, MCP server,
                      API keys, scopes, rate limits, usage logs, docs endpoints.
/products/swipht      First product: contributor dashboard, project workspace,
                      admin, Telegram submission bot. Served on its own subdomain.
/products/<name>      Future products. Same rule: call core and infra, never copy logic.
```

**Build rules**
- First, move code with no logic changes. Keep the move in its own commit or pull request.
- Supabase Edge Functions deploy only from `supabase/functions/`. `build:core` copies `/core` into `supabase/functions/_shared/core/`. That copy is generated. Nobody edits it by hand. CI fails if the copy differs from `/core`.
- Supabase function entry points stay in `supabase/functions/`. They import from the generated copy.
- `/core` must not depend on React, browser APIs, or Node-only modules.

**Checks**
- The web app runs.
- The Developer API and MCP server run.
- All existing tests pass.
- A search for submission logic and scoring logic outside `/core` returns nothing.
- Folder structure matches the layout above.

**Done when:** all checks pass and the founder has seen the layout.

### Step 2: P0 fixes (F1 to F4)

F1 depends on Step 1, because the MCP submit path must call `/core`.

**Done when:** every P0 row in Section 2 is marked done with its check result.

### Step 3: P1 fixes (F5 to F16)

These do not touch scoring. Do them after P0.

**Done when:** every P1 row in Section 2 is marked done with its check result.

### Step 4: Reputation system

Build from `raidfi-reputation-spec-v1.3.md`. The spec is handed over at the start of this step.

**4a. Data and rules in `/core`**
- Rating from 1 to 5 on every accepted submission. Reason is required for AI ratings, optional for human.
- XP by rating level (Section 1).
- Quality = rating converted to 0 to 100.
- Evidence shrinkage with k = 5, pillars starting at 50.
- Weekly counting cap: 5 accepted items per week count toward depth and consistency.
- Tier gates (spec Section 5.3).
- Inactive and dormant states (spec Section 6).
- Score snapshots stored weekly, with formula version.

**4b. Remove from the score**
- Telegram linking points.
- Referral points.
- XP as an input.
- The 200-record cap. Read full history from aggregates.
- The "fewer than 3 submissions is multiplied by 60" rule. Show "not enough data" instead.
- The XP-based API tiers (Newcomer to Legend). The API uses the same five tiers as the dashboard.

**4c. Project setup (data and API only, UI can follow)**
- Project sets criteria per level, or uses the RaidFi default template.
- Project sets its standing review owner: Self or RaidFi.
- Project sets who approves the first 50 AI ratings: RaidFi or Self.

**4d. Review queue**
- Shows 50 items per batch per project.
- A batch is a view only. Scores use full history.

**4e. Calibration record**
- Store each rating, its approval or change, and the agreement count.
- Calculate agreement across the first 50 items.
- Switch rule: 80% or more. The AI switch itself is built in Step 6.

**Checks**
- Every rule in the spec has a test.
- Dashboard, project workspace, Developer API and MCP show the same score for the same person.
- Tier gates tested at 0, 3, 10, 25 and 60 accepted items, with weeks active varied.
- A person with 3 perfect items does not reach Trusted.
- Telegram linking and referrals change nothing in the score.
- XP changes when a rating changes. Score does not change from XP alone.
- Every rating change is logged with its reason.

**Done when:** all checks pass and the founder has reviewed a sample breakdown.

### Step 5: Review for Self and RaidFi owners (human only)

- Project review page: shows the queue (50 per batch), lets the reviewer set a rating and a reason, and shows the result.
- Owner setting: Self or RaidFi. Every change is logged.
- Human-only mode is the only mode in this step.

**Checks**
- A project can set its owner and see its queue.
- A rating saved here updates the score through `/core`.
- An owner change is logged.
- Another project's queue cannot be read (project scoping).

**Done when:** all checks pass.

### Step 6: AI connection and AI recommendations (after Step 5 is live)

- Project connects its agent through MCP with a project key that has review scope, or brings its own key (BYOK).
- BYOK keys are stored server-side and encrypted. Never in browser storage.
- During the first 50, the AI rates each item with a reason. The approver approves or changes it.
- Agreement is measured. At 80% or more, the AI decides from item 51.
- Changing AI later: 20 items under the same rule.
- Low-confidence AI ratings always go to a human.
- Every AI rating has a reason and can be appealed.

**Guardrails (enforced on the server, not in the prompt)**
- Scope, rate limits and project boundaries are checked by the server.
- Every AI action is logged with its reason.
- The AI cannot apply slashes.
- The AI cannot change the rules in `/core`.

**Checks**
- An AI rating without a reason is rejected.
- An AI action outside project scope is rejected.
- Calibration switch happens at exactly 80% and not at 79%.
- A switch can be reversed by RaidFi admin.

**Done when:** all checks pass and the founder has run one project through calibration on test data.

### Step 7: Shadow run for system flags (30 to 60 days)

- System flags are created from four triggers: burst activity, duplicate content, high share of level 1 ratings from one reviewer, and account clusters.
- Flags are logged. Nothing is applied to any score.
- No slashes are created in this step.

**Checks**
- Each trigger produces a log entry with its evidence.
- No score changes from a system flag.

**Done when:** the shadow period has run for 30 to 60 days and the logs are reviewed by Data & Intelligence.

### Step 8: Flags and slashes go live (LAST, Legal-gated)

Do not start this step until Legal & Compliance has reviewed and the founder has signed off in writing.

**Legal must confirm first**
- Slash levels: note, dampen for 30 days, remove items until appeal.
- Appeal process: one appeal, second reviewer decides.
- Visibility: only the person and RaidFi admins see slashes in V1.
- Flag limits: 5 per user per week (proposal).
- AI's role: flags are checked and a slash can be recommended. AI never applies a slash.
- Use of flagger data and privacy effects.
- Anything the review finds about reputation and real people.

**Build**
- Flags: raise, review queue, confirm, dismiss, escalate.
- Slashes at the three levels, applied only by a human.
- Appeal once. Second reviewer decides.
- Track outcome of every case: confirmed, dismissed, overturned.
- Feature switch, off by default. Turned on only after sign-off.

**Checks**
- An AI-recommended slash cannot apply without a human.
- An appeal changes the outcome and is logged.
- A dismissed flag lowers the flagger's weight.
- Slashes are not visible to anyone except the person and RaidFi admins.

**Done when:** Legal sign-off is in writing, the founder approves, and the switch is turned on.

---

## 4. Later (not part of this plan)

These are parked on purpose. Do not build them now.

- Telegram and Discord activity tracking (submission channels only for now).
- Other platforms beyond X.
- AI decides mode for projects beyond calibration.
- Calibration recheck after 200 total calibration items. This is a later improvement, not a gate.
- Viewers who set their own criteria.
- Raid Pools and Raid Teams.
- On-chain work. Testnet only after the gate below.

**Testnet gate (to start testnet work):** P0 and P1 closed, Steps 4 and 5 passed, and Step 6 live. Founder approves.

---

## 5. Open items

| Item | Owner | Needed before |
|---|---|---|
| Flags and slashes: Legal review | Legal & Compliance | Step 8 |
| Minimum sample sizes for predictive and tier-spread checks | Data & Intelligence | Step 4 checks |
| Testnet gate criteria confirmed in writing | Founder | Testnet work |

---

## 6. What to send the builder, and when

1. This brief (now).
2. The reputation spec v1.3 (at the start of Step 4).
3. Nothing else unless the founder sends it.
