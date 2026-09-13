# Palette's Journal - Critical UX Learnings

## 2026-03-31 - Icon-Only Footer Links Accessibility
**Learning:** Icon-only navigation and social links in footer footers are frequently missed by screen readers and keyboard users if they lack explicit `aria-label` attributes and keyboard focus rings (`focus-visible`).
**Action:** Always audit social icon links for `aria-label`, visible focus indicator (`focus-visible:ring-2`), and native `title` standard attributes.
