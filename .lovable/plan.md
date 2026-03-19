

## Plan: Full Waitlist Overhaul, Auth, Dashboard, Referrals, Contact Redesign, Whitepaper Fix

This is a large overhaul touching database, edge functions, and many frontend pages. Here's the breakdown.

---

### 1. Database Changes (single migration)

New tables:
- **`profiles`** — `id uuid PK`, `user_id uuid NOT NULL UNIQUE` (references auth.users ON DELETE CASCADE), `email text NOT NULL`, `referral_code text UNIQUE NOT NULL`, `referral_count int DEFAULT 0`, `waitlist_completed boolean DEFAULT false`, `x_shared boolean DEFAULT false`, `created_at timestamptz DEFAULT now()`. RLS: users can read/update own row, admins can read all.
- **`waitlist_tasks`** — `id uuid PK`, `task_type text NOT NULL` (telegram, x_follow, x_comment), `label text NOT NULL`, `url text NOT NULL`, `sort_order int DEFAULT 0`, `is_active boolean DEFAULT true`, `created_at timestamptz`. RLS: public read, admin manage. Seeded with 3 default rows (Telegram, X follow, X comment post).

Alter existing:
- `waitlist_submissions`: add `referral_code text`, `referred_by text` (nullable), `x_shared boolean DEFAULT false` columns.

New function:
- `generate_referral_code()` — returns a random 8-char alphanumeric string, used as default for `profiles.referral_code`.

Update `check_email_exists` to also check `profiles` table.

### 2. Waitlist Flow — Complete Rewrite (`src/pages/Waitlist.tsx`)

Slide-based multi-step flow:

```text
Step 1: Welcome → "Start" button
Step 2: Tasks (fetched from waitlist_tasks table)
        - Each task = button that opens link
        - On click: 5-second countdown timer, then green checkmark
        - All tasks must be completed to proceed
Step 3: Email input
        - Submit email → insert into waitlist_submissions
        - Generate referral code, create profile row
Step 4: "Congrats, you joined!" message
Step 5: Final verification — "Share on X" button
        - Opens X intent: "I just joined the RaidFi waitlist. Don't miss this → [referral link]"
        - referral link = site URL + ?ref=[their_referral_code]
        - On click: mark x_shared=true, waitlist_completed=true
        - After click: create auth user via signInWithOtp (sends them their first OTP)
        - Show "You're verified! Check your email to login"
```

No hardcoded task URLs — all fetched from `waitlist_tasks` table.

### 3. OTP Login System (`src/pages/Login.tsx` — new)

- Email input → `signInWithOtp({ email, shouldCreateUser: false })`
- OTP verification (6-digit)
- After verify: check `profiles` table for `waitlist_completed = true`
  - If not completed → sign out, show "Complete waitlist first"
  - If completed → redirect to `/dashboard`

### 4. User Dashboard (`src/pages/Dashboard.tsx` — new)

Protected route. Layout with sidebar/tabs:
- **Contribute** — moved from current `/contributions` page (remove auth prompts, user is already logged in)
- **Referrals** — show referral code, copy button, total referral count
- **RaidFi** — "Coming Soon" placeholder

Dashboard layout: simple sidebar or tab navigation, clean design matching admin panel style.

### 5. Move Contributions to Dashboard

- Remove `/contributions` as a public route
- Strip auth/login UI from the Contributions component (user is already authenticated in dashboard)
- Contributions becomes a component rendered inside Dashboard

### 6. Referral System

- Each user gets a unique `referral_code` on waitlist completion
- Referral link format: `https://raidfi.lovable.app/waitlist?ref=CODE`
- When new user completes waitlist with `?ref=` param: increment referrer's `referral_count` in profiles, store `referred_by` in waitlist_submissions
- Dashboard shows: referral link (copyable), total referral count

### 7. Admin: Tasks Manager (`src/pages/admin/TasksManager.tsx` — new)

- CRUD for `waitlist_tasks` table
- Edit label, URL, sort order, active/inactive toggle
- Add new tasks (for future expansion)
- Added to admin sidebar navigation

### 8. Contact Page Redesign (`src/pages/Contact.tsx`)

Split layout:
- **Left side**: Email (hello.raidfi@gmail.com) + X link (x.com/raidfi_app)
- **Right side**: Contact form (same fields)
- **Mobile**: stacked (info on top, form below)
- Remove Discord references everywhere (Footer too)

### 9. Whitepaper Caching Fix (`src/pages/Whitepaper.tsx`)

- Add `updated_at` to cache key validation
- On load: always fetch latest `version` + `updated_at` (lightweight query)
- Compare with cached values — if different, fetch full content
- If same, use cache
- Reduces unnecessary full-content fetches while ensuring updates reflect immediately

### 10. Navbar Update

- Replace "Contribute" link with "Login" (points to `/login`)
- Keep "Request Access" button pointing to `/waitlist`
- Remove Discord from Footer

### 11. Route Changes (`src/App.tsx`)

```text
New routes:
  /login → Login page
  /dashboard → Dashboard (protected)
  /dashboard/contribute → Contribute tab
  /dashboard/referrals → Referrals tab

Modified:
  /contributions → removed (or redirect to /dashboard/contribute)

Admin routes:
  /admin/tasks → TasksManager (new)
```

### 12. Auth Guard Hook (`src/hooks/useAuth.ts` — new)

- Checks session + `waitlist_completed` from profiles
- Redirects to `/login` if not authenticated
- Used by Dashboard pages

---

### Technical Details

**Migration SQL** creates profiles table, waitlist_tasks table, alters waitlist_submissions, seeds default tasks, creates referral code generator function.

**RLS policies**:
- `profiles`: authenticated users SELECT/UPDATE own row, admins SELECT all
- `waitlist_tasks`: public SELECT where is_active=true, admin full access
- `waitlist_submissions`: existing anon insert policy stays, add referral columns

**Edge function**: `notify-admin-contribution` already exists and stays as-is.

**OTP flow**: Uses Supabase built-in `signInWithOtp`. User account created during waitlist completion (step 5). Login uses `shouldCreateUser: false` to prevent signups outside waitlist.

**Backward compatibility**: Existing waitlist users won't have profiles yet. The login page will check — if no profile exists but email is in `waitlist_submissions`, auto-create a profile with `waitlist_completed: true` on first login. This ensures old users aren't locked out.

