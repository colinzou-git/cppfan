import { beforeEach, describe, expect, it, vi } from "vitest";
import { runCode, runTests } from "@/features/code-lab/code-lab-service";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { resolveUserExerciseExecution } from "@/features/code-lab/user-exercise-code-lab";

// Force the user-exercise path: no static config, a DB-resolved config at v2.
vi.mock("@/features/code-lab/code-lab-catalog", () => ({ getCodeLabConfigForItem: vi.fn() }));
vi.mock("@/features/code-lab/user-exercise-code-lab", () => ({ resolveUserExerciseExecution: vi.fn() }));

const mockedConfig = vi.mocked(getCodeLabConfigForItem);
const mockedResolve = vi.mocked(resolveUserExerciseExecution);

const USER_ITEM = "user.item.00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  vi.clearAllMocks();
  mockedConfig.mockReturnValue(null);
  mockedResolve.mockResolvedValue({
    config: {
      starterCode: "int main(){}",
      visibleTests: [{ name: "v", stdin: "", expectedStdout: "x", matcher: "exact" }],
      skillTags: ["user.skill.x"]
    },
    hiddenTests: [{ name: "h", stdin: "", expectedStdout: "y", matcher: "exact" }],
    publishedVersionId: "v2"
  });
});

describe("stale user-exercise definition (#488)", () => {
  it("runTests refuses a run whose expected version is stale, without executing", async () => {
    const result = await runTests({ itemId: USER_ITEM, source: "int main(){}", expectedVersionId: "v1" });
    expect(result.staleDefinition).toBe(true);
    expect(result.status).toBe("runner_error");
    expect(result.total).toBe(0);
    expect(result.visible).toHaveLength(0);
  });

  it("runCode refuses a stale run", async () => {
    const result = await runCode({ itemId: USER_ITEM, source: "int main(){}", expectedVersionId: "v1" });
    expect(result.staleDefinition).toBe(true);
    expect(result.status).toBe("runner_error");
  });

  it("does not flag stale when the expected version matches the published one", async () => {
    process.env.CODE_RUNNER_PROVIDER = "mock";
    const result = await runTests({ itemId: USER_ITEM, source: "int main(){}", expectedVersionId: "v2" });
    expect(result.staleDefinition).toBeFalsy();
  });

  it("does not flag stale when no expected version is supplied", async () => {
    process.env.CODE_RUNNER_PROVIDER = "mock";
    const result = await runCode({ itemId: USER_ITEM, source: "int main(){}" });
    expect(result.staleDefinition).toBeFalsy();
  });
});
