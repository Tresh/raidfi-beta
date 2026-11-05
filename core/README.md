# /core

Shared RaidFi rules. Pure TypeScript: no React, no browser APIs, no Node-only modules, no HTTP routes.

- Web app imports via `@core/<file>`.
- Edge Functions import the generated copy at `supabase/functions/_shared/core/<file>.ts`.
- After editing anything here run `node scripts/build-core.mjs`. CI (`core-sync`) fails if the copy differs.

Contents (moved unchanged in Step 1):
- `reputation.ts` - current reputation model (to be replaced in Step 4).
- `projectMetrics.ts` - project workspace field catalogue, filters, ranking.
- `x-post.ts` - X post fetcher used for ownership and code checks.
