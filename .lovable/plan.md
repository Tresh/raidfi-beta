## Bug fixes (already applied)

- **Waitlist blank screen** — the X share URL was malformed (`https://x.com{encoded}`), so on mobile the redirect navigated away to a broken page before the next step could render. Fixed the URL to `https://x.com/intent/tweet?text=…` and now advance the step *before* the mobile redirect so users return to the share screen.
- **Referral code missing for new contributors** — the old code called `update({ referral_code: undefined })` which did nothing. Now: if a profile is missing a code we copy the one from their waitlist signup; if no profile exists yet we create it and pre-fill the referral code from the waitlist row so the link they already shared keeps working.

## Telegram bot — what we'll build

### 1. Database

New table `telegram_links` that connects a Telegram user to a RaidFi account:

- `telegram_user_id` (primary key)
- `telegram_chat_id`, `telegram_username`, `first_name`
- `email` (the linked RaidFi account, lowercase)
- `linked_at`, `dm_subscribed` (default true)

New table `telegram_link_codes` for the one-time-code flow:

- `code` (8 chars), `email`, `expires_at` (15 min), `used`

New table `telegram_updates` for idempotent webhook storage (stores `update_id`, raw payload).

All tables: RLS on, admin-only read, service role full access.

### 2. Edge functions

- `telegram-webhook` (public, `verify_jwt = false`) — receives Telegram updates, verifies the secret token header, routes commands.
- `telegram-link-code` (authed) — called from the Contributions page to mint a one-time code the user types into the bot.
- `notify-telegram` (existing) — extended so new tasks also DM every linked + subscribed user, in addition to the existing group post.

### 3. Auth gate (waitlist-first)

Every command except `/start` and `/help` requires a linked account. `/start` shows two link options:

- **Option A — One-time code from the site**: user opens RaidFi → Contributions → copies an 8-char code → sends `/link CODE123` in DM. Most secure, no email typing in chat.
- **Option B — Email OTP**: user sends `/link you@example.com`, bot checks they're on the waitlist (via `check_email_exists`), sends a 6-digit code via the existing OTP email, user replies with `/verify 123456`.

If the email isn't on the waitlist, the bot replies with the waitlist link and stops — no account is linked.

### 4. Slash commands

Work in DM and in the group. Group replies are short; DM replies are richer.

| Command | What it does |
|---|---|
| `/start` | Welcome + link instructions |
| `/link <code\|email>` | Begin account linking (code or email OTP) |
| `/verify <otp>` | Complete email-OTP linking |
| `/whoami` | Show linked email + RaidFi XP |
| `/tasks` | List active contribute tasks with points + "Do task" button to the site |
| `/submit <x-url>` | Submit a contribution. Validates Tweet URL, inserts into `contributions`, triggers `fetch-post-text` + `notify-admin-contribution` |
| `/mypoints` | Total XP, overall rank, contributions count |
| `/leaderboard` | Top 10 from `get_leaderboard` |
| `/whitepaper` | Link to whitepaper + version |
| `/unsubscribe` / `/subscribe` | Toggle task DM notifications |
| `/help` | Command list |

### 5. Task delivery (both DM + group)

When an admin saves a task in `ContributeTasksManager`, `notify-telegram` will:

1. Post the existing rich card to the configured group (current behavior).
2. Fan out a DM to every row in `telegram_links` where `dm_subscribed = true`, with a "Do task" button to the contributions page.

Failed sends (user blocked the bot, etc.) are logged but don't break the broadcast.

### 6. Webhook setup

After deploy, register the webhook from the sandbox:

```
POST https://connector-gateway.lovable.dev/telegram/setWebhook
  url = https://<project>.supabase.co/functions/v1/telegram-webhook
  secret_token = sha256("telegram-webhook:" + TELEGRAM_API_KEY)
  allowed_updates = ["message"]
```

The same derivation runs inside the webhook so we can verify `X-Telegram-Bot-Api-Secret-Token` without storing another secret.

---

## Open question before I build

For account linking, do you want me to ship **both** options (one-time code *and* email OTP), or only one of them? Shipping both is small extra work; let me know and I'll start implementing.