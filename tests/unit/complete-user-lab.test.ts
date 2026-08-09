import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { getLabForOwner } from "@/features/user-content/user-content-queries";
import { validateLabCumulativeAgainstPayload } from "@/features/labs/lab-cumulative-validation";
import { persistUserLabVersionCompletion } from "@/features/labs/user-lab-progress";
import { completeUserLab } from "@/features/labs/complete-user-lab";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/features/user-content/user-content-queries", () => ({
  getLabForOwner: vi.fn()
}));
vi.mock("@/features/labs/lab-cumulative-validation", () => ({
  validateLabCumulativeAgainstPayload: vi.fn()
}));
vi.mock("@/features/labs/user-lab-progress", () => ({
  persistUserLabVersionCompletion: vi.fn()
}));

const mockedCreate = vi.mocked(createClient);
const mockedLab = vi.mocked(getLabForOwner);
const mockedValidate = vi.mocked(validateLabCumulativeAgainstPayload);
const mockedPersist = vi.mocked(persistUserLabVersionCompletion);
const ITEM = "user.item.00000000-0000-0000-0000-000000000042";

function payload() {
  return {
    schemaVersion: 1,
    title: "Lab",
    summary: "",
    taskDescription: "Task",
    mode: "milestones",
    evaluationMode: "automated_tests",
    milestones: [
      {
        id: "m1",
        title: "One",
        instructions: "One",
        required: true,
        tests: [{ name: "t", input: "", expectedOutput: "ok", hidden: false }]
      }
    ]
  };
}

function client(evidence: Array<{ milestone_id: string; code_snapshot_hash: string | null }>) {
  const query = {
    select: () => query,
    eq: () => query,
    not: async () => ({ data: evidence, error: null })
  };
  return {
    auth: { getUser: async () => ({ data: { user: { id: "user" } } }) },
    from: () => query
  } as unknown as NonNullable<Awaited<ReturnType<typeof createClient>>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreate.mockResolvedValue(
    client([{ milestone_id: "m1", code_snapshot_hash: "a".repeat(64) }])
  );
  mockedLab.mockResolvedValue({
    publishedPayload: payload(),
    publishedVersionId: "version"
  } as never);
  mockedValidate.mockResolvedValue({ status: "ok", regressedMilestoneIds: [] });
  mockedPersist.mockResolvedValue({ status: "completed" });
});

describe("completeUserLab authoritative orchestration (#669)", () => {
  it("blocks missing durable evidence before runner validation", async () => {
    mockedCreate.mockResolvedValue(client([]));
    const result = await completeUserLab({
      itemId: ITEM,
      expectedContentVersionId: "version",
      source: "source"
    });
    expect(result).toEqual({
      status: "missing_milestone_evidence",
      milestoneIds: ["m1"]
    });
    expect(mockedValidate).not.toHaveBeenCalled();
    expect(mockedPersist).not.toHaveBeenCalled();
  });

  it("maps regression and unavailable validation without persistence", async () => {
    mockedValidate.mockResolvedValueOnce({
      status: "regressed",
      regressedMilestoneIds: ["m1"]
    });
    await expect(
      completeUserLab({
        itemId: ITEM,
        expectedContentVersionId: "version",
        source: "source"
      })
    ).resolves.toEqual({ status: "regressed", milestoneIds: ["m1"] });
    expect(mockedPersist).not.toHaveBeenCalled();

    mockedValidate.mockResolvedValueOnce({
      status: "unavailable",
      regressedMilestoneIds: [],
      message: "runner down"
    });
    await expect(
      completeUserLab({
        itemId: ITEM,
        expectedContentVersionId: "version",
        source: "source"
      })
    ).resolves.toEqual({
      status: "validation_unavailable",
      message: "runner down"
    });
    expect(mockedPersist).not.toHaveBeenCalled();
  });

  it("detects a republish race after successful validation", async () => {
    mockedLab
      .mockResolvedValueOnce({
        publishedPayload: payload(),
        publishedVersionId: "version"
      } as never)
      .mockResolvedValueOnce({
        publishedPayload: payload(),
        publishedVersionId: "version-2"
      } as never);
    const result = await completeUserLab({
      itemId: ITEM,
      expectedContentVersionId: "version",
      source: "source"
    });
    expect(result.status).toBe("stale_definition");
    expect(mockedPersist).not.toHaveBeenCalled();
  });

  it("persists the current version only after evidence and cumulative validation", async () => {
    mockedPersist.mockResolvedValueOnce({ status: "already_completed" });
    const result = await completeUserLab({
      itemId: ITEM,
      expectedContentVersionId: "version",
      source: "source"
    });
    expect(result.status).toBe("already_completed");
    expect(mockedValidate).toHaveBeenCalledWith(
      expect.objectContaining({ source: "source", itemId: ITEM })
    );
    expect(mockedPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: ITEM,
        contentVersionId: "version"
      })
    );
  });
});
