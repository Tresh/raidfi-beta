import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listMyContributions from "./tools/list-my-contributions";
import getLeaderboard from "./tools/get-leaderboard";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "raidfi",
  title: "RaidFi",
  version: "0.1.0",
  instructions: "Tools for RaidFi contributors: read your profile and XP, list your tracked X posts, and view the leaderboard.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfile, listMyContributions, getLeaderboard],
});
