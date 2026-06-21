import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compareOutput, runCode, runTests } from "@/features/code-lab/code-lab-service";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { getHiddenTestsForItem } from "@/features/code-lab/code-lab-hidden-tests";
import { CODE_LAB_LIMITS } from "@/features/code-lab/code-lab-types";

const HELLO_ITEM = "cpp.program_basics.structure.lesson";
const ECHO_ITEM = "cpp.program_basics.io.lesson";

const originalProvider = process.env.CODE_RUNNER_PROVIDER;

beforeEach(() => {
  process.env.CODE_RUNNER_PROVIDER = "mock";
});

afterEach(() => {
  if (originalProvider === undefined) delete process.env.CODE_RUNNER_PROVIDER;
  else process.env.CODE_RUNNER_PROVIDER = originalProvider;
});

describe("compareOutput matchers", () => {
  it("matches exact, trimmed, and contains", () => {
    expect(compareOutput("a\n", "a\n", "exact")).toBe(true);
    expect(compareOutput("a\n", "a", "exact")).toBe(false);
    expect(compareOutput("  a \n", "a", "trimmed")).toBe(true);
    expect(compareOutput("hello world", "world", "contains")).toBe(true);
  });
});

describe("runCode with the mock runner", () => {
  it("runs the starter program and returns simulated output", async () => {
    const config = getCodeLabConfigForItem(HELLO_ITEM)!;
    const result = await runCode({ itemId: HELLO_ITEM, source: config.starterCode });
    expect(result.status).toBe("success");
    expect(result.stdout).toBe("Hello, cppFan!\n");
    expect(result.simulated).toBe(true);
  });
});

describe("runTests", () => {
  it("passes the visible and hidden tests for a correct starter solution", async () => {
    const config = getCodeLabConfigForItem(HELLO_ITEM)!;
    const result = await runTests({ itemId: HELLO_ITEM, source: config.starterCode });
    expect(result.status).toBe("ok");
    expect(result.visible.every((test) => test.passed)).toBe(true);
    expect(result.hiddenTotal).toBe(getHiddenTestsForItem(HELLO_ITEM).length);
    expect(result.hiddenPassed).toBe(result.hiddenTotal);
    expect(result.passed).toBe(result.total);
  });

  it("does not leak hidden test inputs or expected outputs to the result", async () => {
    const config = getCodeLabConfigForItem(ECHO_ITEM)!;
    const result = await runTests({ itemId: ECHO_ITEM, source: config.starterCode });
    const serialized = JSON.stringify(result);
    // The hidden echo phrase must never appear in the summarised result.
    expect(serialized).not.toContain("keep it secret");
    expect(result.hiddenTotal).toBeGreaterThan(0);
    expect(result.visible.every((test) => !test.hidden)).toBe(true);
  });

  it("fails a visible test when output is wrong", async () => {
    const wrong = `#include <iostream>\nint main(){ std::cout << "Goodbye" << "\\n"; }`;
    const result = await runTests({ itemId: HELLO_ITEM, source: wrong });
    expect(result.visible[0].passed).toBe(false);
    expect(result.passed).toBeLessThan(result.total);
  });
});

describe("limits", () => {
  it("exposes bounded source and stdin sizes", () => {
    expect(CODE_LAB_LIMITS.maxSourceChars).toBeGreaterThan(0);
    expect(CODE_LAB_LIMITS.maxStdinChars).toBeGreaterThan(0);
  });
});
