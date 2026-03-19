

## Plan: Restructure Contribute Page, Fix Waitlist Tasks, Whitepaper, Contact, Admin

This is a large restructure. Here's every change organized by area.

---

### 1. Database Migration

**Alter `waitlist_tasks`:**
- Add `requires_input boolean DEFAULT false` — for tasks that need user input (e.g. comment link)
- Add `input_label text` — placeholder/label for the input field
- Add `input_placeholder text` — input placeholder text
- Add `verification_type text DEFAULT 'manual'` — how to verify (e.g. `username`, `link`, `manual`)

**New table `waitlist_task_submissions`:**
- `id uuid PK`
- `submission_email text NOT NULL` — ties to waitlist flow (pre-auth)
- `task_id uuid NOT NULL REFERENCES waitlist_tasks(id)`
- `clicked_at timestamptz` — when they clicked the task link
- `verified_at timestamptz` — when they clicked verify
- `input_value text` — user-provided input (comment link, username, etc.)
- `created_at timestamptz DEFAULT now()`
- RLS: anon/authenticated INSERT, admin SELECT/ALL

**New table `contribute_tasks`:** (admin-managed tasks shown on contribute page)
- `id uuid PK`
- `label text NOT NULL`
- `description text`
- `points integer NOT NULL DEFAULT 0`
- `task_type text NOT NULL DEFAULT 'link'` — link, form, custom
- `url text` — optional link
- `sort_order integer DEFAULT 0`
- `is_active boolean DEFAULT true`
- `created_at timestamptz DEFAULT now()`
- RLS: public SELECT where active, admin ALL

**New table `contribute_task_completions`:**
- `id uuid PK`
- `user_id uuid NOT NULL`
- `task_id uuid NOT NULL REFERENCES contribute_tasks(id)`
- `completed_at timestamptz DEFAULT now()`
- `UNIQUE(user_id, task_id)`
- RLS: auth users read/insert own, admin ALL

**Alter `profiles`:**
- Add `name text` — display name, asked on first contribute visit
- Add `total_points integer DEFAULT 0` — aggregated points (waitlist 50 + validation 200 + contributions + tasks)

---

### 2. Route Changes (`App.tsx`)

**Remove:**
- `/dashboard`, `/dashboard/referrals`, `/dashboard/raidfi` routes
- Dashboard imports (DashboardLayout, Contribute dashboard, Referrals, RaidFi)

**Modify:**
- `/contributions` stays as the main contribute page (rewrite it)
- Add `/feed` — public live feed page (moved out of contribute)

**Keep:**
- `/login` route exists but NOT in navbar

---

### 3. Navbar Changes

- Remove "Login" from nav links
- Keep: Home, Whitepaper, Contact, Request Access button

---

### 4. Contributions Page Rewrite (`/contributions`)

This page has login gate (OTP in sidebar like current), then after login shows:

**Layout: Main content + Sidebar**

**Sidebar (right on desktop, top on mobile):**
- If not logged in: OTP login form (email → code → verify)
- If logged in: User info card, submit post form

**Main content sections (top to bottom):**

1. **Name prompt** — if profile has no `name`, show inline input asking for display name before anything else

2. **User Info Card** — points, current leaderboard position (#N), referral count

3. **Referral Section** — referral code, referral link, copy button (inline, from current Referrals page)

4. **Post Submission** — submit X post URL form (same as current)

5. **Tasks Section** — admin-managed contribute tasks fetched from `contribute_tasks` table. Each shows label, description, points. User clicks to complete. Includes the validation form task (label: "Complete Validation Form", points: 200, type: "form", links to existing ValidationForm). Admin can add more tasks.

6. **Leaderboard** — show first 10, "See More" loads next 10. Show user's current position. Display name or masked email. Time filter (All/24h/7d/30d).

**Points calculation:** Sum of waitlist points (50) + validation points (200) + contribution points + contribute task points. Store as `total_points` on profile, or calculate dynamically from all sources.

---

### 5. Feed Page (`/feed`) — New

- Public page, no auth required
- Shows approved contributions with tweet embeds
- **No engage button** — remove it entirely
- Keep: user email (masked), date, Open link, engagement count display
- Load more pagination (20 per page)

---

### 6. Waitlist Task Fixes (`Waitlist.tsx`)

**Remove auto-complete timer.** Replace with:

1. User clicks task button → opens link, records `clicked_at` timestamp
2. After clicking, show a "Verify" button (disabled for 10 seconds minimum after click as anti-abuse)
3. For tasks with `requires_input = true`: show input field (e.g. "Paste your comment link" or "Enter your X username")
4. For X tasks: require X username input for verification
5. For Telegram task: require Telegram username
6. User clicks Verify → records `verified_at`, stores input value in `waitlist_task_submissions`
7. Task shows as completed only after verify

**Anti-abuse:**
- Minimum 10-second delay between click and verify
- Track timestamps server-side in `waitlist_task_submissions`
- State stored per-task, can't skip via manipulation

**Admin task types (in TasksManager):**
- `telegram` — requires Telegram username input on verify
- `x_follow` — requires X username input on verify  
- `x_comment` — requires comment link input on verify
- `custom` — just click + verify
- `input` — requires custom input field

---

### 7. Admin TasksManager Fixes

**Fix save button** — it currently calls `handleUpdate` which does work, but the issue is likely that `as any` casting bypasses type checks. Will ensure proper typing.

**Add to task editor:**
- Task type dropdown (telegram, x_follow, x_comment, custom, input)
- "Requires Input" toggle
- Input label field (when requires_input is true)
- Input placeholder field

**Add task submissions viewer** — show who completed which tasks with their input values

---

### 8. Admin: Contribute Tasks Manager (new page)

- New admin page at `/admin/contribute-tasks`
- CRUD for `contribute_tasks` table
- Set label, description, points, task_type, url, active toggle
- View completions count per task
- Added to admin sidebar

---

### 9. Contact Page

- Add Telegram community link card (t.me/raidfi_community) alongside Email and X cards on the left side

---

### 10. Whitepaper Caching Fix

The current code looks correct in logic but uses `as any` casting on the `whitepaper` table. The issue is likely that the table name isn't in the generated types. Fix:
- Remove `as any` casts, use proper table reference
- Add TTL: store timestamp in cache, if older than 5 minutes always refetch meta
- Ensure `setWhitepaper` is called even when cache matches (it currently only sets state from `getCached()` initial value which may be stale if component remounts)

---

### 11. Profile Referral Code Fix

In `Login.tsx` and `Contributions.tsx` (on login):
- After auth, fetch profile
- If profile exists but `referral_code` is null/empty → call update with `generate_referral_code()` default
- If no profile exists → create one with auto-generated referral code
- Prevent duplicate profiles with `maybeSingle()` check

---

### 12. Points Aggregation

Leaderboard and user points should include ALL sources:
- `waitlist_submissions.points` (50)
- `validation_submissions.points_earned` (200)  
- `contributions.points_earned` (per approved post)
- `contribute_task_completions` → join with `contribute_tasks.points`

Calculate dynamically on fetch, or maintain `profiles.total_points` updated via triggers.

For simplicity: calculate client-side from multiple queries, cache in state.

---

### Technical Details

**Files to create:**
- `src/pages/Feed.tsx` — public feed page
- Admin contribute tasks page

**Files to heavily modify:**
- `src/pages/Contributions.tsx` — full rewrite with referral, tasks, leaderboard sections
- `src/pages/Waitlist.tsx` — remove auto-verify, add verify button + input fields
- `src/pages/admin/TasksManager.tsx` — add task type dropdown, input fields, fix save
- `src/pages/Contact.tsx` — add Telegram card
- `src/pages/Whitepaper.tsx` — fix caching
- `src/pages/Login.tsx` — referral code fix, redirect to /contributions not /dashboard
- `src/App.tsx` — route changes
- `src/components/Navbar.tsx` — remove Login link

**Files to delete/remove:**
- Dashboard route references (keep files for future, just remove routes)

**Migration:** Single SQL migration covering all table changes.

