// GENERATED from /core by scripts/build-core.mjs. Do not edit by hand.
// Idempotency key for a review action. Score, points and notes are part of the key,
// so a corrected re-review is a new request and returns the new result.
export interface ReviewInput {
  contribution_id: string;
  decision: string;
  points?: number;
  score?: number;
  notes?: string;
}

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function reviewIdempotencyKey(r: ReviewInput): string {
  const payload = JSON.stringify([r.decision, r.points ?? null, r.score ?? null, r.notes ?? ""]);
  return `mcp-${r.contribution_id}-${r.decision}-${fnv1a(payload)}`;
}
