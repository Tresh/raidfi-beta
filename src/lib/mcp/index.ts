import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listMyContributions from "./tools/list-my-contributions";
import getLeaderboard from "./tools/get-leaderboard";
import listDocs from "./tools/list-docs";
import readDoc from "./tools/read-doc";
import { getProjectAnalytics, listProjectContributions, reviewContribution, getContributorReputation } from "./tools/project-tools";
import { submitContribution, analyzeMyPerformance } from "./tools/contributor-tools";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "raidfi",
  title: "RaidFi",
  version: "0.3.0",
  instructions:
    "RaidFi contribution intelligence. Contributors: submit X posts, list your submissions with review notes, analyze your performance, check profile and leaderboard. Projects: pass your project API key (rf_live_...) to read analytics, list submissions, approve or reject them with XP and notes, and check any contributor's reputation. Use list_docs and read_doc to read the RaidFi docs, API reference and whitepaper.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile, listMyContributions, getLeaderboard, submitContribution, analyzeMyPerformance,
    getProjectAnalytics, listProjectContributions, reviewContribution, getContributorReputation, listDocs, readDoc,
  ],
});
