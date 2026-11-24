import { readBatchIdentifiers } from "./batch-input.ts";

Deno.test("identifiers and handles resolve to the same batch input", () => {
  const identifiers = readBatchIdentifiers({ identifiers: ["alice", "bob"] });
  const handles = readBatchIdentifiers({ handles: ["alice", "bob"] });
  if (JSON.stringify(identifiers) !== JSON.stringify(handles)) {
    throw new Error("identifiers and handles must resolve to the same batch input");
  }
});