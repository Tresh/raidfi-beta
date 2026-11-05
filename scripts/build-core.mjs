// Copies /core into supabase/functions/_shared/core (generated, do not edit).
// `node scripts/build-core.mjs --check` exits 1 if the copy differs from /core.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC = "core";
const OUT = "supabase/functions/_shared/core";
const BANNER = "// GENERATED from /core by scripts/build-core.mjs. Do not edit by hand.\n";
const check = process.argv.includes("--check");

const files = readdirSync(SRC).filter((f) => f.endsWith(".ts"));
let drift = [];
if (!check) { rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true }); }
for (const f of files) {
  const want = BANNER + readFileSync(join(SRC, f), "utf8");
  const target = join(OUT, f);
  if (check) {
    if (!existsSync(target) || readFileSync(target, "utf8") !== want) drift.push(f);
  } else writeFileSync(target, want);
}
if (check) {
  const extra = existsSync(OUT) ? readdirSync(OUT).filter((f) => !files.includes(f)) : [];
  drift = drift.concat(extra);
  if (drift.length) { console.error("core copy out of date:", drift.join(", "), "- run build:core"); process.exit(1); }
  console.log("core copy in sync");
} else console.log(`copied ${files.length} files to ${OUT}`);
