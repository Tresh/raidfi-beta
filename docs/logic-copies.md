# Copies of submission / scoring logic outside /core

Step 1 waiver: these copies were listed, not merged. Merging waits for Step 4 (F1 X link rule excepted, pending founder approval).

## Submission (X link / ownership)
| File | What it does |
|---|---|
| supabase/functions/telegram-webhook/index.ts | Bot's own X link rule (`TWEET_URL_REGEX`, `BOT_FIND_URL`). Held on original behavior. |
| supabase/functions/verify-x-handle/index.ts | Own X post link regex for account verification posts. |
| supabase/functions/verify-project-x/index.ts | Own X post link regex for project verification posts. |
| src/pages/dashboard/Settings.tsx | Client-side X post link regex for verification post. |
| src/pages/Profile.tsx | Loose `status/<id>` check before loading post images. |
| src/components/dashboard/ContributionComposer.tsx | Client-side link check and ownership warning preview. |
| src/lib/mcp/tools/contributor-tools.ts | Duplicate-post guard before calling the shared submit function. |

## Scoring / XP / reputation
| File | What it does |
|---|---|
| supabase/functions/verify-contribution/index.ts | AI score modifier (-5..+5) and XP `max(1, 10 + modifier)`. Differs from spec XP table. |
| supabase/functions/public-api/index.ts | API review sets points (0..1000 clamp). |
| supabase/functions/mcp/index.ts (generated) and src/lib/mcp/tools/*.ts | Own average score / acceptance rate math. |
| src/pages/Contributions.tsx | `calculatePoints` client-side points total. |
| src/hooks/useContributorData.ts | Calls `computeReputation` from /core (not a copy; listed for reference). |
| Database functions `recalculate_leaderboard_score`, `recalculate_all_leaderboard_scores` | Leaderboard score in SQL. |

## Waivers
- Hosting-branding cleanup deferred by founder (logged waiver).
