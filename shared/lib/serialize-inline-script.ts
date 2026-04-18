function escapeScriptString(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function serializeForInlineScript(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  const valueType = typeof value;

  if (valueType === "string") return escapeScriptString(value as string);
  if (valueType === "number" || valueType === "boolean") return String(value);
  if (valueType === "function") return value.toString();

  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeForInlineScript(item)).join(",")}]`;
  }

  if (valueType === "object") {
    const objectEntries = Object.entries(value as Record<string, unknown>).map(
      ([key, objectValue]) => `${escapeScriptString(key)}:${serializeForInlineScript(objectValue)}`,
    );
    return `{${objectEntries.join(",")}}`;
  }

  throw new Error(`Unsupported value in inline script serializer: ${valueType}`);
}
