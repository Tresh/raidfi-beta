# RaidFi interface, Telegram, and wording fixes

## What will change

### 1. AI Analyst header
- Remove the second header inside the AI page.
- Extend the project workspace header so the AI Analyst page shows “AI Analyst” centered, with connection status directly underneath.
- Keep the project menu button on the left and place the chats/settings sidebar button on the far right.
- Preserve the full-height chat area and make the right panel open as a mobile drawer.

### 2. Contributors mobile layout
- Remove the Contributors description under the page title.
- Reflow the date range and Save controls below the title on narrow screens.
- Make tabs, search, criteria, shortlist controls, and table actions fit without clipping.
- Keep the full data table horizontally scrollable while preserving its desktop layout.

### 3. RaidFi email branding
- Audit auth and approval email sender names, subjects, and visible template branding.
- Replace any remaining “RaidFi Launch” branding with “RaidFi”; keep wording such as “RaidFi launched tomorrow” only where “launched” is ordinary sentence text, not a brand name.
- Redeploy only the email functions whose branding changes.

### 4. Telegram project-aware submissions
- Add a short-lived pending Telegram submission record so `/submit <X link>` can ask which active project the post is for using inline project buttons.
- Handle Telegram callback selections, pass the selected `project_id` into the shared contribution submission flow, and confirm the chosen project.
- In a connected project group, infer the project from that group automatically when someone drops an X link.
- Allow bot commands and dropped links in configured project groups, not only the main RaidFi group.
- Route new contribution notifications to the main enabled RaidFi group and the selected project’s connected group, without duplicate sends.
- Await/report notification delivery safely so a successful contribution is not silently lost before Telegram posting completes.
- Deploy the Telegram webhook and notification functions, re-register the webhook for callback updates, and verify webhook status plus signed delivery.

### 5. Project form
- Remove both Telegram fields and the Telegram connection section from the public project request form.
- Stop sending Telegram values from that form; project owners can configure Telegram later from project settings.

### 6. Dashboard notifications
- Replace the bell’s Explore link with a real popover.
- Show the signed-in contributor’s latest contribution/activity updates, with a clear empty state and links only where relevant.

### 7. Remove public waitlist wording
- Replace every public “Join the waitlist” action/message with “Request Beta Access” and point it to `/beta`.
- Update Telegram onboarding and access-denied messages to refer to beta access, not joining a waitlist.
- Update referral links and visible referral copy to use the beta page.
- Keep legacy waitlist database/admin records intact so existing access and historical data continue working.

## Technical details
- Add one locked-down public table for pending Telegram submission choices, with service-role access and automatic expiry handling.
- Reuse the existing `projects.telegram_group_id`, `projects.telegram_bot_added`, and `contributions.project_id` fields; no parallel project system.
- Use the existing contribution submission function as the single source of truth for X ownership checks, inserts, media fetching, and notifications.
- Validate the affected pages at mobile and desktop widths, then run focused tests and a production build.
