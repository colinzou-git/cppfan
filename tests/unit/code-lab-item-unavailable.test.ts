import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";

// Force resolution through mocked layers so we can make an item "unavailable"
// deterministically (#614). code-lab-service resolves via code-lab-item-resolver,
// which reads these modules.
vi.mock("@/features/code-lab/code-lab-catalog", () => ({ getCodeLabConfigForItem: vi.fn() }));
vi.mock("@/features/code-lab/code-lab-hidden-tests", () => ({ getHiddenTestsForItem: vi.fn(() => []) }));
vi.mock("@/features/code-lab/user-exercise-code-lab", () => ({ resolveUserExerciseExecution: vi.fn(async () => null) }));
vi.mock("@/features/code-lab/user-lab-code-lab", () => ({ resolveUserLabExecution: vi.fn(async () => null) }));
vi.mock("@/features/code-lab/user-interview-code-lab", () => ({ resolveUserInterviewExecution: vi.fn(async () => null) }));

import { runCode, runTests } from "@/features/code-lab/code-lab-service";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { resolveUserExerciseExecution } from "@/features/code-lab/user-exercise-code-lab";

const mockedNative = vi.mocked(getCodeLabConfigForItem);
const mockedExercise = vi.mocked(resolveUserExerciseExecution);

const UNKNOWN_USER_ITEM = "user.item.00000000-0000-0000-0000-000000000009";
const originalProvider = process.env.CODE_RUNNER_PROVIDER;

function config(): LearningItemCodeLab {
  return { enabled: true, language: "cpp", mode: "stdin", starterCode: "int main(){}", visibleTests: [], skillTags: ["s"] };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CODE_RUNNER_PROVIDER = "mock";
  mockedNative.mockReturnValue(null);
  mockedExercise.mockResolvedValue(null);
});

afterEach(() => {
  if (originalProvider === undefined) delete process.env.CODE_RUNNER_PROVIDER;
  else process.env.CODE_RUNNER_PROVIDER = originalProvider;
});

describe("Run and Test agree on an unavailable item (#614)", () => {
  // provider "none" + itemUnavailable can only come from the pre-runner refusal;
  // the mock runner always reports provider "mock" + simulated true.
  it("runCode refuses an unresolved item before the runner", async () => {
    const result = await runCode({ itemId: UNKNOWN_USER_ITEM, source: "int main(){}" });
    expect(result.itemUnavailable).toBe(true);
    expect(result.status).toBe("runner_error");
    expect(result.provider).toBe("none");
    expect(result.simulated).toBe(false);
    expect(result.note).toMatch(/no longer available/i);
  });

  it("runTests refuses an unresolved item with the same signal (not a zero-test success)", async () => {
    const result = await runTests({ itemId: UNKNOWN_USER_ITEM, source: "int main(){}" });
    expect(result.itemUnavailable).toBe(true);
    expect(result.status).toBe("runner_error");
    expect(result.status).not.toBe("ok");
    expect(result.provider).toBe("none");
    expect(result.total).toBe(0);
    expect(result.note).toMatch(/no longer available/i);
  });

  it("an unknown native-looking id is unavailable for both actions too", async () => {
    const run = await runCode({ itemId: "does.not.exist", source: "int main(){}" });
    const test = await runTests({ itemId: "does.not.exist", source: "int main(){}" });
    expect(run.itemUnavailable).toBe(true);
    expect(test.itemUnavailable).toBe(true);
  });

  it("a valid resolvable item is NOT flagged unavailable (zero visible tests is a real ok result)", async () => {
    mockedExercise.mockResolvedValue({ config: config(), hiddenTests: [], publishedVersionId: "v1" });
    const result = await runTests({ itemId: UNKNOWN_USER_ITEM, source: "int main(){}" });
    expect(result.itemUnavailable).toBeFalsy();
    expect(result.status).toBe("ok");
  });
});
