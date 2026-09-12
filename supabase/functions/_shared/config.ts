// Central configuration for site domain and URLs used across Supabase Edge Functions.

export const ROOT_DOMAIN = Deno.env.get("ROOT_DOMAIN") || "beta.raidfi.site";
export const SITE_ORIGIN = Deno.env.get("SITE_ORIGIN") || `https://${ROOT_DOMAIN}`;
export const SENDER_DOMAIN = Deno.env.get("SENDER_DOMAIN") || `notify.${ROOT_DOMAIN}`;
export const FROM_DOMAIN = Deno.env.get("FROM_DOMAIN") || ROOT_DOMAIN;
export const DEFAULT_FROM_EMAIL = `RaidFi <beta@${ROOT_DOMAIN}>`;
