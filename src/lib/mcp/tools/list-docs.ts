import { defineTool } from "@lovable.dev/mcp-js";
import { DOCS } from "../../docs/content";

export default defineTool({
  name: "list_docs",
  title: "List docs",
  description: "List every RaidFi documentation page (slug, section, title, summary).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const docs = DOCS.map(({ slug, section, title, summary }) => ({ slug, section, title, summary }));
    return { content: [{ type: "text", text: JSON.stringify(docs) }], structuredContent: { docs } };
  },
});
