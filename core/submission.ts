// Shared submission rules. Pure TS: no React, browser or Node-only APIs.
// The website's X link rule is the single rule for every surface (web, Telegram, MCP).

export const X_POST_URL_REGEX = /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/\s]+\/status\/\d+/i;

/** True when the value is a direct link to an X post. */
export function isXPostUrl(value: string): boolean {
  return X_POST_URL_REGEX.test(String(value ?? "").trim());
}

/** Finds the first X post link inside free text (e.g. a chat message). */
export function findXPostUrl(text: string): string | null {
  const m = String(text ?? "").match(/https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/\s]+\/status\/\d+/i);
  return m ? m[0] : null;
}

export const cleanHandle = (v: string) => String(v ?? "").trim().replace(/^@/, "").toLowerCase();

/** Handle from an oEmbed author_url such as https://twitter.com/someone */
export function handleFromAuthorUrl(authorUrl: string): string {
  return cleanHandle(String(authorUrl ?? "").split("/").filter(Boolean).pop() ?? "");
}

export type OwnershipResult = { ok: true } | { ok: false; error: string };

/** A post is accepted only when its author matches the submitter's verified X handle. */
export function checkPostOwnership(authorHandle: string, verifiedHandle: string): OwnershipResult {
  const a = cleanHandle(authorHandle);
  const v = cleanHandle(verifiedHandle);
  if (!v) return { ok: false, error: "Verify your X account in Settings before submitting contributions." };
  if (!a || a !== v) {
    return { ok: false, error: `This post is from @${a || "unknown"}. Only posts from your verified @${v} account are accepted.` };
  }
  return { ok: true };
}
