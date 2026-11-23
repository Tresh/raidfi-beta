import { describe, it, expect } from "vitest";
import { reviewIdempotencyKey } from "./review";

const base = { contribution_id: "11111111-1111-1111-1111-111111111111", decision: "approved", points: 10, score: 80, notes: "Good" };

describe("reviewIdempotencyKey", () => {
  it("same review gives the same key (safe retry)", () => {
    expect(reviewIdempotencyKey(base)).toBe(reviewIdempotencyKey({ ...base }));
  });
  it("a corrected score gives a new key, so the re-review runs", () => {
    expect(reviewIdempotencyKey({ ...base, score: 60 })).not.toBe(reviewIdempotencyKey(base));
  });
  it("corrected notes give a new key", () => {
    expect(reviewIdempotencyKey({ ...base, notes: "Off-topic" })).not.toBe(reviewIdempotencyKey(base));
  });
});
