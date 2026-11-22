import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkPostOwnership } from "@core/submission";

// Fake backend: the submit endpoint applies the real /core ownership rule.
const POST_AUTHOR = "someoneelse";
const CALLER_VERIFIED = "caller";
vi.mock("../supabase", () => ({
  supabaseForUser: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
  }),
}));

describe("MCP submit_contribution", () => {
  beforeEach(() => {
    (globalThis as any).Deno = { env: { get: () => "https://backend.test" } };
    globalThis.fetch = vi.fn(async () => {
      const r = checkPostOwnership(POST_AUTHOR, CALLER_VERIFIED);
      return new Response(JSON.stringify(r.ok ? { contribution_id: "x" } : { error: r.error }), { status: r.ok ? 200 : 403 });
    }) as any;
  });

  it("rejects a post the caller does not own", async () => {
    const { submitContribution } = await import("./contributor-tools");
    const ctx = { getUserEmail: () => "c@test.dev", getToken: () => "t" } as any;
    await expect(
      (submitContribution as any).handler({ post_url: "https://x.com/someoneelse/status/1" }, ctx),
    ).rejects.toThrow(/Only posts from your verified @caller account/);
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining("/functions/v1/submit-contribution"), expect.anything());
  });
});
