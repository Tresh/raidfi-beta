export function readBatchIdentifiers(body: unknown): unknown {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return undefined;
  return Reflect.get(body, "identifiers") ?? Reflect.get(body, "handles");
}