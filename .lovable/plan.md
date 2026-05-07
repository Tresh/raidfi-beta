## Goal

Produce a single, very detailed design system reference document (Markdown) that another AI can use to rebuild the RaidFi product (the actual app) with the exact same visual language as this landing site. No code changes to this project — output is a downloadable file.

## Deliverable

A long-form `RAIDFI_DESIGN_SYSTEM.md` saved to `/mnt/documents/` and surfaced as a downloadable artifact, covering:

1. **Brand & Philosophy** — vision, tone, "minimalist teal-first" aesthetic, admin-UI rules (no glassmorphism), copy strategy.
2. **Color System** — every HSL token from `index.css` (light + dark), with hex equivalents, usage rules, semantic mapping (primary, secondary, accent, muted, card, sidebar, etc.), and the rule "never hardcode colors, always use tokens".
3. **Typography** — Inter + Space Grotesk, weights, scale (h1–h6, body, captions), tracking, leading, the `text-gradient` utility.
4. **Spacing & Layout** — container widths (`max-w-3xl/5xl/6xl`), section padding (`py-20/32`), grid patterns (`grid-cols-X gap-px bg-border` divider trick), responsive breakpoints.
5. **Radii, Borders, Shadows** — `--radius` token, rounded-2xl/3xl conventions, 1px hairline borders.
6. **Component Patterns** with full code snippets:
   - Buttons (all variants + sizes from `button.tsx`)
   - Cards (the `bg-card p-7 group hover:bg-background` pattern)
   - Grid-of-cards with `gap-px bg-border rounded-2xl overflow-hidden` divider trick
   - Section header pattern (eyebrow `text-xs uppercase tracking-widest text-primary` + h2 + lede)
   - Hero pattern (grid background, badge pill, gradient text, dual CTAs, bottom fade)
   - Navbar (transparent → `bg-background/95 backdrop-blur-md` on scroll, mobile sheet)
   - CTA band (primary background block with subtle grid overlay)
   - Numbered list pattern (WhyNow style, big faded numerals)
   - Step/process pattern (Solution.tsx with arrow connectors)
   - Stats/metrics grid (NetworkEffects)
   - Footer
   - Form inputs, labels, textareas (compact `h-9/h-10`, `text-sm`)
   - Admin layout rules (solid backgrounds, no transparency, ConfirmDialog usage)
7. **Backgrounds & Decorative Effects** — the subtle grid `linear-gradient` background, gradient fade overlays, `text-gradient` utility.
8. **Animations & Motion** — framer-motion conventions (`initial/whileInView/viewport`, durations 0.4–0.6, stagger via `delay: index * 0.05–0.1`), the keyframe utilities (`fade-in`, `scale-in`, `slide-in-right`, accordion), `hover-scale`, `story-link`, hover transitions on cards, group hover patterns.
9. **Iconography** — lucide-react, sizing (w-4 h-4 inside w-9 h-9 tinted square `bg-primary/5`).
10. **Tailwind Config Reference** — full token-to-tailwind mapping, sidebar tokens, container settings.
11. **File Structure Conventions** — components/ui (shadcn), feature components, page composition style.
12. **Do's and Don'ts** — explicit rules pulled from the project memories (no hardcoded colors, no glassmorphism in admin, compact form density, no trophy icons, hover state restraint, etc.).
13. **Drop-in Starter Snippets** — `index.css`, `tailwind.config.ts`, `components.json`, and `lib/utils.ts` reproduced verbatim so the other AI can copy them directly.

## Process

1. Read remaining components (`Footer`, `HowItWorks`, `Problem`, `Value`, `Whitepaper`, dashboard layout, admin layout) to capture every pattern in use.
2. Write the markdown file in one pass to `/mnt/documents/RAIDFI_DESIGN_SYSTEM.md`.
3. Emit a `<lov-artifact>` so it's downloadable.

## Notes

- Document will be long (target ~1500–2500 lines). No code changes to this project.
- Output is framework-agnostic in description but includes React + Tailwind code samples since that's how patterns are expressed here.
- If you'd prefer a different format (PDF, multiple files split per topic, or include screenshots of each component), tell me before I generate.
