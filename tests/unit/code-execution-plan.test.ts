import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolvedCodeLabItem } from "@/features/code-lab/code-lab-item-resolver";
import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";

vi.mock("@/features/code-lab/code-lab-item-resolver", () => ({
  resolveCodeLabItem: vi.fn()
}));

import { resolveCodeLabItem } from "@/features/code-lab/code-lab-item-resolver";
import { resolveCodeExecutionPlan } from "@/features/code-lab/code-execution-plan";
import { DEFAULT_COMPILER_FLAGS } from "@/features/code-lab/code-lab-defaults";

const mockedResolve = vi.mocked(resolveCodeLabItem);

function resolvedItem(
  config: LearningItemCodeLab,
  overrides: Partial<ResolvedCodeLabItem> = {}
): ResolvedCodeLabItem {
  return {
    source: "native",
    itemId: "item",
    prompt: "",
    skillTags: [],
    config,
    hiddenTests: [],
    files: [],
    ...overrides
  };
}

function stdinConfig(): LearningItemCodeLab {
  return {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    starterCode: "",
    visibleTests: [{ name: "visible", stdin: "1", expectedStdout: "1" }]
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolveCodeExecutionPlan (#666)", () => {
  it("returns raw stdin source, defaults, tests, and files from one resolution", async () => {
    mockedResolve.mockResolvedValue({
      status: "ok",
      item: resolvedItem(stdinConfig(), {
        files: [{ name: "fixture.txt", content: "ok" }],
        hiddenTests: [{ name: "hidden", stdin: "2", expectedStdout: "2" }]
      })
    });
    const result = await resolveCodeExecutionPlan({
      itemId: "item",
      learnerSource: "int main(){}"
    });
    expect(result).toMatchObject({
      status: "ok",
      plan: {
        preparedSource: "int main(){}",
        compilerFlags: [...DEFAULT_COMPILER_FLAGS],
        files: [{ name: "fixture.txt", content: "ok" }]
      }
    });
  });

  it("wraps function source with exactly one main", async () => {
    mockedResolve.mockResolvedValue({
      status: "ok",
      item: resolvedItem({
        ...stdinConfig(),
        mode: "function",
        functionSignature: "int add(int a, int b)"
      })
    });
    const source = "int add(int a, int b){ return a+b; }";
    const result = await resolveCodeExecutionPlan({ itemId: "item", learnerSource: source });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.plan.preparedSource).toContain(source);
    expect(result.plan.preparedSource.match(/int main\(/g)).toHaveLength(1);
  });

  it("threads milestone/version and returns that milestone contract", async () => {
    mockedResolve.mockResolvedValue({
      status: "ok",
      item: resolvedItem(stdinConfig(), {
        contentVersionId: "version-2",
        milestoneIndex: 1,
        files: [{ name: "m2.txt", content: "milestone two" }]
      })
    });
    const result = await resolveCodeExecutionPlan({
      itemId: "item",
      expectedContentVersionId: "version-2",
      milestoneIndex: 1,
      learnerSource: "source"
    });
    expect(mockedResolve).toHaveBeenCalledWith({
      itemId: "item",
      expectedContentVersionId: "version-2",
      milestoneIndex: 1
    });
    expect(result).toMatchObject({
      status: "ok",
      plan: { contentVersionId: "version-2", milestoneIndex: 1, files: [{ name: "m2.txt" }] }
    });
  });

  it.each([
    ["stale_definition", "stale_definition"],
    ["not_found", "item_unavailable"]
  ] as const)("maps resolver %s to %s", async (resolverStatus, expectedStatus) => {
    mockedResolve.mockResolvedValue({ status: resolverStatus });
    await expect(
      resolveCodeExecutionPlan({ itemId: "item", learnerSource: "source" })
    ).resolves.toMatchObject({ status: expectedStatus });
  });

  it("refuses a malformed function contract before execution", async () => {
    mockedResolve.mockResolvedValue({
      status: "ok",
      item: resolvedItem({
        ...stdinConfig(),
        mode: "function",
        functionSignature: "int f(std::map<int,int> value)"
      })
    });
    await expect(
      resolveCodeExecutionPlan({ itemId: "item", learnerSource: "int f(){return 0;}" })
    ).resolves.toMatchObject({ status: "invalid_contract" });
  });

  it("prefers caller flags, then item flags, then defaults", async () => {
    mockedResolve.mockResolvedValue({
      status: "ok",
      item: resolvedItem({ ...stdinConfig(), compilerFlags: ["-std=c++17", "-O2"] })
    });
    const caller = await resolveCodeExecutionPlan({
      itemId: "item",
      learnerSource: "source",
      compilerFlags: ["-std=c++20", "-g"]
    });
    expect(caller).toMatchObject({
      status: "ok",
      plan: { compilerFlags: ["-std=c++20", "-g"] }
    });
    const item = await resolveCodeExecutionPlan({ itemId: "item", learnerSource: "source" });
    expect(item).toMatchObject({
      status: "ok",
      plan: { compilerFlags: ["-std=c++17", "-O2"] }
    });
  });
});
