import { describe, expect, it } from "vitest";
import { serializeForInlineScript } from "../../src/lib/serialize-inline-script";

describe("serializeForInlineScript", () => {
  it("serializes primitive values", () => {
    expect(serializeForInlineScript(null)).toBe("null");
    expect(serializeForInlineScript(undefined)).toBe("undefined");
    expect(serializeForInlineScript(42)).toBe("42");
    expect(serializeForInlineScript(true)).toBe("true");
  });

  it("escapes strings for inline script safety", () => {
    expect(serializeForInlineScript("</script>")).toBe('"\\u003c/script>"');
    expect(serializeForInlineScript("line\u2028sep\u2029end")).toBe('"line\\u2028sep\\u2029end"');
  });

  it("serializes functions, arrays, and nested objects", () => {
    const payload = {
      title: "ManabuPlay",
      enabled: true,
      count: 3,
      list: ["alpha", 2, false],
      run: function hello() {
        return "ok";
      },
      nested: {
        safe: "<daily>",
      },
    };

    const serialized = serializeForInlineScript(payload);

    expect(serialized).toContain('"title":"ManabuPlay"');
    expect(serialized).toContain('"enabled":true');
    expect(serialized).toContain('"count":3');
    expect(serialized).toContain('"list":["alpha",2,false]');
    expect(serialized).toContain("function hello()");
    expect(serialized).toContain('"safe":"\\u003cdaily>"');
  });

  it("throws on unsupported symbols", () => {
    expect(() => serializeForInlineScript(Symbol("x"))).toThrow(/Unsupported value/);
  });
});
