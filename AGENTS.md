# AGENTS.md

- Shared rules (scoring, XP, submission validation, X post checks) live in `/core` as pure TS; web imports `@core/*`, so one source serves every surface.
- Edge Functions import `supabase/functions/_shared/core/*`, a generated copy made by `node scripts/build-core.mjs`; never hand-edit it, because functions deploy only from `supabase/functions/` and CI `--check` fails on drift.
- Web app code stays in `src/` and functions in `supabase/functions/`; `/infra` and `/products/swipht` READMEs map ownership, because the hosting build only reads those paths.
- The active builder brief is `docs/planning/raidfi-beta-fix-and-replan.md`; follow its steps in order.
