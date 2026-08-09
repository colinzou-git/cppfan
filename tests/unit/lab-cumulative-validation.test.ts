import { afterEach, describe, expect, it, vi } from "vitest";

const { getLabForOwner, executeRun } = vi.hoisted(() => ({
  getLabForOwner: vi.fn(),
  executeRun: vi.fn()
}));
vi.mock("@/features/user-content/user-content-queries", () => ({ getLabForOwner }));
vi.mock("@/features/code-lab/code-runner", async () => {
  const actual = await vi.importActual<typeof import("@/features/code-lab/code-runner")>(
    "@/features/code-lab/code-runner"
  );
  return { ...actual, executeRun };
});

import { validateLabCumulative } from "@/features/labs/lab-cumulative-validation";

const ITEM = "user.item.00000000-0000-0000-0000-000000000001";

function milestonesPayload() {
  return {
    schemaVersion: 1,
    title: "Shell",
    mode: "milestones",
    evaluationMode: "automated_tests",
    milestones: [
      {
        id: "m1",
        title: "Parse",
        instructions: "p",
        required: true,
        tests: [{ name: "t1", input: "", expectedOutput: "PASS\n", hidden: false }]
      },
      {
        id: "m2",
        title: "Run",
        instructions: "r",
        required: true,
        tests: [{ name: "t2", input: "", expectedOutput: "OTHER\n", hidden: false }]
      }
    ]
  };
}

afterEach(() => vi.clearAllMocks());

describe("validateLabCumulative (#610)", () => {
  it("reports required milestones the current code no longer passes", async () => {
    getLabForOwner.mockResolvedValue({
      publishedPayload: milestonesPayload(),
      publishedVersionId: "v1"
    });
    // The runner always prints "PASS\n": m1 (expects PASS) passes, m2 (expects OTHER) fails.
    executeRun.mockResolvedValue({ status: "success", stdout: "PASS\n" });

    const result = await validateLabCumulative({
      itemId: ITEM,
      contentVersionId: "v1",
      source: "int main(){}"
    });
    expect(result.status).toBe("regressed");
    expect(result.regressedMilestoneIds).toEqual(["m2"]);
  });

  it("returns ok when the code passes every required milestone", async () => {
    const payload = milestonesPayload();
    payload.milestones[1].tests[0].expectedOutput = "PASS\n";
    getLabForOwner.mockResolvedValue({ publishedPayload: payload, publishedVersionId: "v1" });
    executeRun.mockResolvedValue({ status: "success", stdout: "PASS\n" });
    expect(
      (await validateLabCumulative({ itemId: ITEM, contentVersionId: "v1", source: "x" })).status
    ).toBe("ok");
  });

  it("fails closed when no runner is configured", async () => {
    getLabForOwner.mockResolvedValue({
      publishedPayload: milestonesPayload(),
      publishedVersionId: "v1"
    });
    executeRun.mockResolvedValue({ status: "runner_unconfigured", stdout: "" });
    expect(
      (await validateLabCumulative({ itemId: ITEM, contentVersionId: "v1", source: "x" })).status
    ).toBe("unavailable");
  });

  it("refuses a stale content version", async () => {
    getLabForOwner.mockResolvedValue({
      publishedPayload: milestonesPayload(),
      publishedVersionId: "v2"
    });
    const r = await validateLabCumulative({ itemId: ITEM, contentVersionId: "v1", source: "x" });
    expect(r.status).toBe("stale");
    expect(executeRun).not.toHaveBeenCalled();
  });

  it("is unavailable for a non-user or unpublished item", async () => {
    expect((await validateLabCumulative({ itemId: "native.x", source: "x" })).status).toBe(
      "unavailable"
    );
    getLabForOwner.mockResolvedValue(null);
    expect((await validateLabCumulative({ itemId: ITEM, source: "x" })).status).toBe("unavailable");
  });

  it("rejects a required milestone with no tests as an invalid definition", async () => {
    const payload = milestonesPayload();
    payload.milestones[0].tests = [];
    getLabForOwner.mockResolvedValue({ publishedPayload: payload, publishedVersionId: "v1" });
    const result = await validateLabCumulative({
      itemId: ITEM,
      contentVersionId: "v1",
      source: "x"
    });
    expect(result.status).toBe("invalid_definition");
    expect(executeRun).not.toHaveBeenCalled();
  });

  it("treats infrastructure runner errors as unavailable", async () => {
    getLabForOwner.mockResolvedValue({
      publishedPayload: milestonesPayload(),
      publishedVersionId: "v1"
    });
    executeRun.mockResolvedValue({ status: "runner_error", stdout: "" });
    const result = await validateLabCumulative({
      itemId: ITEM,
      contentVersionId: "v1",
      source: "x"
    });
    expect(result.status).toBe("unavailable");
  });
});
