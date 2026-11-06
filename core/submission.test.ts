import { describe, it, expect } from "vitest";
import { isXPostUrl, findXPostUrl, checkPostOwnership, handleFromAuthorUrl } from "./submission";

describe("X link rule (website rule, used everywhere)", () => {
  it("accepts x.com and twitter.com post links", () => {
    expect(isXPostUrl("https://x.com/fomowlhq/status/2117737936137367717")).toBe(true);
    expect(isXPostUrl("https://twitter.com/a/status/1")).toBe(true);
  });
  it("accepts www. and handles with dots or dashes (bot used to reject these)", () => {
    expect(isXPostUrl("https://www.x.com/a/status/1")).toBe(true);
    expect(isXPostUrl("https://x.com/some.one/status/1")).toBe(true);
  });
  it("rejects non-post links", () => {
    expect(isXPostUrl("https://x.com/someone")).toBe(false);
    expect(isXPostUrl("https://example.com/a/status/1")).toBe(false);
  });
  it("finds a link inside text", () => {
    expect(findXPostUrl("look https://x.com/a/status/9 nice")).toBe("https://x.com/a/status/9");
  });
});

describe("post ownership", () => {
  it("rejects a post the caller does not own", () => {
    const r = checkPostOwnership(handleFromAuthorUrl("https://twitter.com/someoneelse"), "me");
    expect(r.ok).toBe(false);
  });
  it("accepts the caller's own post, ignoring case and @", () => {
    expect(checkPostOwnership("Me", "@me").ok).toBe(true);
  });
  it("rejects when the caller has no verified handle", () => {
    expect(checkPostOwnership("me", "").ok).toBe(false);
  });
});
