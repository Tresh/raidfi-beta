# Palette's Journal - Critical UX Learnings

## 2026-03-31 - Icon-Only Footer Links Accessibility
**Learning:** Icon-only navigation and social links in footer footers are frequently missed by screen readers and keyboard users if they lack explicit `aria-label` attributes and keyboard focus rings (`focus-visible`).
**Action:** Always audit social icon links for `aria-label`, visible focus indicator (`focus-visible:ring-2`), and native `title` standard attributes.
## 2025-09-12 - Form accessibility in dialog modal inputs
**Learning:** Native `<select>` elements and custom inputs inside dialog modals in RaidFi lacked explicit `<label htmlFor="...">` associations and `focus-visible` ring indicators for keyboard users.
**Action:** Always associate form inputs with `<label>` tags and provide explicit `focus-visible` rings on custom and native select inputs.
