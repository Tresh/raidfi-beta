import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getDoc } from "../../docs/content";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "read_doc",
  title: "Read doc",
  description: "Read one RaidFi documentation page as Markdown, including the live whitepaper (slug 'whitepaper').",
  inputSchema: { slug: z.string().min(1).describe("Doc slug from list_docs.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    const doc = getDoc(slug);
    if (!doc) throw new ToolError(`Unknown doc '${slug}'. Use list_docs.`);
    let body = doc.body;
    const { data: override, error } = await supabaseForUser(ctx).from("docs_content").select("body").eq("slug", slug).maybeSingle();
    if (error) {
      // docs_content table not present in this environment — fall back to built-in content.
    } else if (override?.body) {
      body = override.body;
    } else if (slug === "whitepaper") {
      const { data } = await supabaseForUser(ctx).from("whitepaper_live").select("content").eq("id", "live").maybeSingle();
      body = data?.content ?? "Whitepaper not available.";
    }
    return { content: [{ type: "text", text: body }], structuredContent: { slug, title: doc.title, markdown: body } };
  },
});
