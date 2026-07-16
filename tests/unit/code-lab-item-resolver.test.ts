import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";

// Mock the layers below the shared resolver: the native catalog, hidden tests,
// and the three kind-specific adapters (#611).
vi.mock("@/features/code-lab/code-lab-catalog", () => ({ getCodeLabConfigForItem: vi.fn() }));
vi.mock("@/features/code-lab/code-lab-hidden-tests", () => ({ getHiddenTestsForItem: vi.fn(() => []) }));
vi.mock("@/features/code-lab/user-exercise-code-lab", () => ({ resolveUserExerciseExecution: vi.fn(async () => null) }));
vi.mock("@/features/code-lab/user-lab-code-lab", () => ({ resolveUserLabExecution: vi.fn(async () => null) }));
vi.mock("@/features/code-lab/user-interview-code-lab", () => ({ resolveUserInterviewExecution: vi.fn(async () => null) }));

import { resolveCodeLabItem } from "@/features/code-lab/code-lab-item-resolver";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { getHiddenTestsForItem } from "@/features/code-lab/code-lab-hidden-tests";
import { resolveUserExerciseExecution } from "@/features/code-lab/user-exercise-code-lab";
import { resolveUserLabExecution } from "@/features/code-lab/user-lab-code-lab";
import { resolveUserInterviewExecution } from "@/features/code-lab/user-interview-code-lab";
import { reviewCode } from "@/features/code-lab/code-review-service";
import { traceCode } from "@/features/code-lab/code-trace-service";
import { explainDebugStep } from "@/features/code-lab/code-debug-explain-service";

const mockedNative = vi.mocked(getCodeLabConfigForItem);
const mockedHidden = vi.mocked(getHiddenTestsForItem);
const mockedExercise = vi.mocked(resolveUserExerciseExecution);
const mockedLab = vi.mocked(resolveUserLabExecution);
const mockedInterview = vi.mocked(resolveUserInterviewExecution);

const USER_ITEM = "user.item.00000000-0000-0000-0000-000000000001";

function config(prompt: string, skillTags: string[]): LearningItemCodeLab {
  return { enabled: true, language: "cpp", mode: "stdin", starterCode: "int main(){}", visibleTests: [], prompt, skillTags };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedNative.mockReturnValue(null);
  mockedHidden.mockReturnValue([]);
  // clearAllMocks resets call history but NOT implementations, so re-arm the
  // adapters to "not this kind" before each test.
  mockedExercise.mockResolvedValue(null);
  mockedLab.mockResolvedValue(null);
  mockedInterview.mockResolvedValue(null);
});

afterEach(() => {
  delete process.env.AI_PROVIDER;
  delete process.env.AI_CHAT_ENABLED;
});

describe("resolveCodeLabItem (#611)", () => {
  it("resolves a native item synchronously without any DB adapter call", async () => {
    mockedNative.mockReturnValue(config("Native prompt", ["cpp.native"]));
    mockedHidden.mockReturnValue([{ name: "h", stdin: "", expectedStdout: "1", matcher: "exact" }]);

    const result = await resolveCodeLabItem({ itemId: "cpp.native.lesson" });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.item.source).toBe("native");
    expect(result.item.prompt).toBe("Native prompt");
    expect(result.item.skillTags).toEqual(["cpp.native"]);
    expect(result.item.hiddenTests).toHaveLength(1);
    // Native must not touch the DB.
    expect(mockedExercise).not.toHaveBeenCalled();
    expect(mockedLab).not.toHaveBeenCalled();
    expect(mockedInterview).not.toHaveBeenCalled();
  });

  it("resolves a published user exercise", async () => {
    mockedExercise.mockResolvedValue({ config: config("Ex prompt", ["user.skill.ex"]), hiddenTests: [], publishedVersionId: "v1" });
    const result = await resolveCodeLabItem({ itemId: USER_ITEM });
    expect(result.status === "ok" && result.item.source).toBe("user_exercise");
    expect(result.status === "ok" && result.item.prompt).toBe("Ex prompt");
    expect(result.status === "ok" && result.item.contentVersionId).toBe("v1");
  });

  it("resolves a multi-milestone lab at the requested milestone (threads the index)", async () => {
    mockedLab.mockResolvedValue({
      config: config("Lab · Milestone 2 instructions", ["user.skill.lab"]),
      hiddenTests: [],
      publishedVersionId: "v3",
      files: [{ name: "data.txt", content: "1 2 3" }]
    });
    const result = await resolveCodeLabItem({ itemId: USER_ITEM, milestoneIndex: 1 });
    expect(mockedLab).toHaveBeenCalledWith(USER_ITEM, 1);
    expect(result.status === "ok" && result.item.source).toBe("user_lab");
    expect(result.status === "ok" && result.item.milestoneIndex).toBe(1);
    expect(result.status === "ok" && result.item.prompt).toContain("Milestone 2");
    expect(result.status === "ok" && result.item.files).toHaveLength(1);
  });

  it("resolves a published user interview problem", async () => {
    mockedInterview.mockResolvedValue({ config: config("Iv prompt", ["user.skill.iv"]), hiddenTests: [], publishedVersionId: "v1", files: [] });
    const result = await resolveCodeLabItem({ itemId: USER_ITEM });
    expect(result.status === "ok" && result.item.source).toBe("user_interview");
    expect(result.status === "ok" && result.item.skillTags).toEqual(["user.skill.iv"]);
  });

  it("returns not_found when no kind resolves", async () => {
    const result = await resolveCodeLabItem({ itemId: USER_ITEM });
    expect(result.status).toBe("not_found");
  });

  it("returns stale_definition when the expected version differs from the published one", async () => {
    mockedLab.mockResolvedValue({ config: config("Lab", ["s"]), hiddenTests: [], publishedVersionId: "v5", files: [] });
    const result = await resolveCodeLabItem({ itemId: USER_ITEM, expectedContentVersionId: "v4" });
    expect(result.status).toBe("stale_definition");
  });
});

describe("AI capabilities enforce the same stale-version behavior (#611)", () => {
  it("reviewCode refuses a stale lab definition", async () => {
    process.env.AI_PROVIDER = "fake";
    mockedLab.mockResolvedValue({ config: config("Lab", ["s"]), hiddenTests: [], publishedVersionId: "v2", files: [] });
    const feedback = await reviewCode(
      { itemId: USER_ITEM, source: "int main(){}", contentVersionId: "v1" },
      new AbortController().signal
    );
    expect(feedback.staleDefinition).toBe(true);
    expect(feedback.status).toBe("unavailable");
  });

  it("traceCode refuses a stale lab definition", async () => {
    process.env.AI_PROVIDER = "fake";
    mockedLab.mockResolvedValue({ config: config("Lab", ["s"]), hiddenTests: [], publishedVersionId: "v2", files: [] });
    const trace = await traceCode(
      { itemId: USER_ITEM, language: "cpp", source: "int main(){}", contentVersionId: "v1" },
      new AbortController().signal
    );
    expect(trace.staleDefinition).toBe(true);
  });

  it("explainDebugStep refuses a stale definition even when AI is disabled", async () => {
    delete process.env.AI_PROVIDER;
    mockedInterview.mockResolvedValue({ config: config("Iv", ["s"]), hiddenTests: [], publishedVersionId: "v2", files: [] });
    const result = await explainDebugStep(
      {
        itemId: USER_ITEM,
        source: "int main(){}",
        snapshot: { status: "paused" } as never,
        contentVersionId: "v1"
      },
      new AbortController().signal
    );
    expect(result.staleDefinition).toBe(true);
    expect(result.status).toBe("unavailable");
  });
});
