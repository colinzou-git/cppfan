import { describe, expect, it } from "vitest";
import { DEBUG_LIMITS, isSafeWatchExpression, validateStartPayload } from "./security";

describe("validateStartPayload (#442)", () => {
  it("accepts a valid payload and normalizes breakpoints/watches", () => {
    const result = validateStartPayload({
      source: "int main(){ return 0; }",
      stdin: "",
      breakpoints: [{ line: 1 }, { line: 3 }],
      watches: ["i", "  ", "i + 1"]
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.breakpointLines).toEqual([1, 3]);
      expect(result.watches).toEqual(["i", "i + 1"]);
    }
  });

  it("rejects empty source", () => {
    const result = validateStartPayload({ source: "   " });
    expect(result).toMatchObject({ ok: false, code: "empty_source" });
  });

  it("rejects too many breakpoints", () => {
    const breakpoints = Array.from({ length: DEBUG_LIMITS.maxBreakpoints + 1 }, (_, i) => ({ line: i + 1 }));
    const result = validateStartPayload({ source: "int main(){}", breakpoints });
    expect(result).toMatchObject({ ok: false, code: "too_many_breakpoints" });
  });

  it("rejects a non-positive breakpoint line", () => {
    const result = validateStartPayload({ source: "int main(){}", breakpoints: [{ line: 0 }] });
    expect(result).toMatchObject({ ok: false, code: "invalid_breakpoint" });
  });

  it("rejects an over-long watch", () => {
    const result = validateStartPayload({
      source: "int main(){}",
      watches: ["x".repeat(DEBUG_LIMITS.maxWatchChars + 1)]
    });
    expect(result).toMatchObject({ ok: false, code: "watch_too_long" });
  });
});

describe("isSafeWatchExpression (#442)", () => {
  it("allows variable and arithmetic expressions", () => {
    expect(isSafeWatchExpression("i")).toBe(true);
    expect(isSafeWatchExpression("i + 1")).toBe(true);
    expect(isSafeWatchExpression("arr[2]")).toBe(true);
  });

  it("rejects calls, assignments, and statement separators", () => {
    expect(isSafeWatchExpression("system(\"rm -rf /\")")).toBe(false);
    expect(isSafeWatchExpression("i = 5")).toBe(false);
    expect(isSafeWatchExpression("a; b")).toBe(false);
    expect(isSafeWatchExpression("")).toBe(false);
  });
});
