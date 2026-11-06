# RaidFi

RaidFi is a reputation layer for Web3 contributors. During beta, contributors submit their own X posts about a project, a reviewer rates each accepted post, and those ratings build the contributor's reputation score on their RaidFi account.

## What works in beta

- **Contributor dashboard** — submit X posts, see review results and your reputation.
- **Project workspace** — review submissions, see analytics on tracked X activity.
- **Telegram bot** — a submission channel (`/submit <link>`). Telegram activity itself is not tracked.
- **Developer API and MCP** — read reputation and contribution data with an API key or OAuth.

X is the only tracked source. XP is earned per accepted post and never feeds reputation.

## Access

RaidFi is in beta. Use **Request Beta Access** on the site: https://beta.raidfi.site

- X: [@RaidFi_App](https://x.com/raidfi_app)
- Docs: https://beta.raidfi.site/docs

## Repository layout

- `/core` — shared rules (scoring, submission checks). Pure TypeScript.
- `src/` — web app. `supabase/functions/` — backend functions.
- `/infra`, `/products/swipht` — ownership maps (see their READMEs).

Run `npm run build:core` after editing `/core`, and `npm test` for the rule tests.

© RaidFi. All rights reserved.
