# /products/swipht

First product: contributor dashboard, project workspace, admin, Telegram submission bot. Subdomain proposed: swipht.raidfi.site (not confirmed).

The hosting platform builds the web app only from `src/` + root `index.html`, and backend functions only from `supabase/functions/`. So the code lives there; this file is the ownership map:

| Part | Live path |
|---|---|
| Web app (pages, components, hooks) | `src/` (except `src/lib/mcp/`, owned by /infra) |
| Submission entry point | `supabase/functions/submit-contribution/` |
| Telegram submission bot | `supabase/functions/telegram-webhook/`, `telegram-*` |
| X verification | `supabase/functions/verify-x-handle/`, `verify-project-x/`, `validate-x-post-owner/` |
| Emails, approvals, notifications | `auth-email-hook`, `beta-approve`, `project-approve`, `notify-*` |

Rule: call `/core` and `/infra`. Never copy logic here.
