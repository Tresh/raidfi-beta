import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { apiKeySchema, callApi, out } from "../api";

export const getProjectAnalytics = defineTool({
  name: "get_project_analytics",
  title: "Project analytics",
  description: "30-day contribution analytics for a project: submissions, accepted, unique contributors, XP awarded, acceptance rate and pending queue size. Needs a full-access project key.",
  inputSchema: { api_key: apiKeySchema },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ api_key }) => {
    const m = (await callApi(api_key, "/metrics")) as Record<string, number>;
    const pending = (await callApi(api_key, "/contributions?status=pending&limit=200")) as { contributions: unknown[] };
    return out({ ...m, acceptance_rate: m.contributions ? Math.round((m.accepted / m.contributions) * 100) : 0, pending_review: pending.contributions.length });
  },
});

export const listProjectContributions = defineTool({
  name: "list_project_contributions",
  title: "List project contributions",
  description: "List a project's submissions with post text, author, status, scores and review notes. Use status=pending to get the review queue.",
  inputSchema: {
    api_key: apiKeySchema,
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ api_key, status, limit }) =>
    out(await callApi(api_key, `/contributions?limit=${limit}${status ? `&status=${status}` : ""}`)),
});

export const reviewContribution = defineTool({
  name: "review_contribution",
  title: "Approve or reject a contribution",
  description: "Approve or reject one of your project's submissions, optionally setting XP, a 0-100 quality score and a note the contributor will see explaining the decision. Lets an AI agent review submissions automatically.",
  inputSchema: {
    api_key: apiKeySchema,
    contribution_id: z.string().uuid(),
    decision: z.enum(["approved", "rejected"]),
    points: z.number().int().min(0).max(1000).optional().describe("XP to award when approving."),
    score: z.number().min(0).max(100).optional().describe("Quality score 0-100."),
    notes: z.string().max(1000).optional().describe("Feedback for the contributor, e.g. why it was rejected."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ api_key, contribution_id, decision, points, score, notes }) =>
    out(await callApi(api_key, `/contributions/${contribution_id}/verify`, {
      method: "PATCH", body: { status: decision, points, score, notes }, idem: `mcp-${contribution_id}-${decision}`,
    })),
});

export const getContributorReputation = defineTool({
  name: "get_contributor_reputation",
  title: "Contributor reputation",
  description: "Look up a contributor's RaidFi reputation (0-1000 score, tier, XP, acceptance rate, verified X) by X handle or email. Works with any project key.",
  inputSchema: { api_key: apiKeySchema, identifier: z.string().min(1).max(200).describe("X handle or email.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ api_key, identifier }) => out(await callApi(api_key, `/reputation/${encodeURIComponent(identifier.replace(/^@/, ""))}`)),
});
