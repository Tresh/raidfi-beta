import { ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

type G = typeof globalThis & { Deno?: { env?: { get?: (n: string) => string | undefined } }; process?: { env?: Record<string, string | undefined> } };
const env = (n: string) => (globalThis as G).Deno?.env?.get?.(n) ?? (globalThis as G).process?.env?.[n];

export const apiKeySchema = z.string().regex(/^rf_live_/).describe("Your project's RaidFi API key (rf_live_...), from Project Settings → Developer API.");

/** Calls the RaidFi Developer API so MCP tools share its key checks, scopes, rate limits and logs. */
export async function callApi(key: string, path: string, init: { method?: string; body?: unknown; idem?: string } = {}) {
  const base = (env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL") ?? "").replace(/\/$/, "");
  const res = await fetch(`${base}/functions/v1/public-api${path}`, {
    method: init.method ?? "GET",
    headers: { "x-api-key": key, "Content-Type": "application/json", ...(init.idem ? { "Idempotency-Key": init.idem } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ToolError((data as { error?: string }).error ?? `RaidFi API error ${res.status}`);
  return data;
}

export const out = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data) }], structuredContent: data as Record<string, unknown> });
