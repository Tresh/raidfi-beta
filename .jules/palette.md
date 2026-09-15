## 2025-05-20 - Mobile Nav and Sidebar Icon Button Accessibility
**Learning:** Icon-only toggle buttons in navigation header components (`AdminLayout`, `Navbar`) were missing `aria-label` screen reader descriptions and `focus-visible:ring` keyboard focus indicators.
**Action:** Always ensure header icon buttons have explicit `aria-label` attributes and standard `focus-visible` ring styles for complete keyboard and screen reader accessibility.
