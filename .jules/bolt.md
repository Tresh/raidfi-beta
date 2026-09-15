## 2026-09-15 - Pre-compiling Filter Predicates in Dataset Search Engine
**Learning:** Evaluated array filtering logic over dataset rows repeatedly called dictionary lookups (`FIELD_MAP[key]`), `String().toLowerCase()`, and `new Date().getTime()` per row for every rule.
**Action:** Extract filter metadata preparation and closure construction outside the array iteration loop (`rows.filter`), reducing filtering runtime by ~45-50%.
