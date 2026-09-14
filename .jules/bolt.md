## 2025-02-23 - Route Code Splitting with React.lazy
**Learning:** In a single-page application built with React and Vite, importing all page components synchronously at top-level in `App.tsx` balloons the initial JS bundle size to ~1.85MB. Route-based code splitting via `React.lazy` and `React.Suspense` reduces entry bundle size to ~583kB (~68% reduction).
**Action:** When adding or auditing routes in React SPA applications, ensure page components are lazy-loaded so users only download JS for the route they visit.
