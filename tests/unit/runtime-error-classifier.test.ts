import { describe, expect, it } from "vitest";
import { classifyRuntimeError } from "@/features/code-lab/runtime-error-classifier";

describe("classifyRuntimeError", () => {
  it("tags AddressSanitizer heap-buffer-overflow as out-of-bounds (high)", () => {
    const tags = classifyRuntimeError({
      stderr: "==1==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x..."
    });
    expect(tags[0]).toMatchObject({ tag: "cpp.vector.out_of_bounds", source: "runtime", confidence: "high" });
  });

  it("tags UBSan out-of-bounds", () => {
    const tags = classifyRuntimeError({
      stderr: "main.cpp:5:9: runtime error: index 5 out of bounds for type 'int [5]'"
    });
    expect(tags.map((t) => t.tag)).toContain("cpp.vector.out_of_bounds");
  });

  it("gives a low-confidence out-of-bounds for a bare segfault", () => {
    const tags = classifyRuntimeError({ stderr: "Segmentation fault", exitCode: 139 });
    expect(tags[0]).toMatchObject({ tag: "cpp.vector.out_of_bounds", confidence: "low" });
  });

  it("emits no stable tag for a timeout", () => {
    expect(classifyRuntimeError({ timedOut: true })).toEqual([]);
  });

  it("returns nothing for clean output and never throws", () => {
    expect(classifyRuntimeError({ stderr: "", exitCode: 0 })).toEqual([]);
    expect(classifyRuntimeError({})).toEqual([]);
  });
});
