## 2025-02-23 - Route Code Splitting with React.lazy
**Learning:** In a single-page application built with React and Vite, importing all page components synchronously at top-level in `App.tsx` balloons the initial JS bundle size to ~1.85MB. Route-based code splitting via `React.lazy` and `React.Suspense` reduces entry bundle size to ~583kB (~68% reduction).
**Action:** When adding or auditing routes in React SPA applications, ensure page components are lazy-loaded so users only download JS for the route they visit.
## 2026-09-15 - Pre-compiling Filter Predicates in Dataset Search Engine
**Learning:** Evaluated array filtering logic over dataset rows repeatedly called dictionary lookups (`FIELD_MAP[key]`), `String().toLowerCase()`, and `new Date().getTime()` per row for every rule.
**Action:** Extract filter metadata preparation and closure construction outside the array iteration loop (`rows.filter`), reducing filtering runtime by ~45-50%.
