# /infra

RaidFi platform surface: Developer API, MCP server, API keys, scopes, rate limits, usage logs, docs endpoints.

Hosting constraints keep the running code at fixed paths. This folder is the ownership map:

| Part | Live path | Why it stays there |
|---|---|---|
| Developer API | `supabase/functions/public-api/` | Backend functions deploy only from `supabase/functions/` |
| MCP server (source) | `src/lib/mcp/` | MCP build plugin reads this path |
| MCP server (deployed) | `supabase/functions/mcp/` | Generated from `src/lib/mcp/` |
| API keys UI + usage dashboard | `src/components/project/DeveloperApiPanel.tsx` | Rendered inside the web app |
| Branded routes `/api/v1`, `/mcp` | `vercel.json` | Vercel reads it from the repo root |
