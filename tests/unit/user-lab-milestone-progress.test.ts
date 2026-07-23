import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { getLabForOwner } from "@/features/user-content/user-content-queries";
import { recordLabMilestonePass } from "@/features/labs/user-lab-milestone-progress";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/features/user-content/user-content-queries", () => ({
  getLabForOwner: vi.fn()
}));

const mockedCreate = vi.mocked(createClient);
const mockedLab = vi.mocked(getLabForOwner);
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
        instructions: "Do one",
        required: true,
        tests: [{ name: "t", input: "", expectedOutput: "ok", hidden: false }]
      }
    ]
  };
}

function client(capture: (row: Record<string, unknown>) => void) {
  return {
    auth: { getUser: async () => ({ data: { user: { id: "user" } } }) },
    from: () => ({
      upsert: (row: Record<string, unknown>) => {
        capture(row);
        return {
          select: () => ({
            single: async () => ({
              data: {
                milestone_id: row.milestone_id,
                milestone_index: row.milestone_index,
                code_snapshot_hash: row.code_snapshot_hash,
                passed_at: row.passed_at
              },
              error: null
            })
          })
        };
      }
    })
  } as unknown as NonNullable<Awaited<ReturnType<typeof createClient>>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedLab.mockResolvedValue({
    publishedPayload: payload(),
    publishedVersionId: "version"
  } as never);
});

describe("authoritative milestone progress (#669)", () => {
  it("verifies version/id/index and stores a server-derived SHA-256", async () => {
    let row: Record<string, unknown> = {};
    mockedCreate.mockResolvedValue(
      client((captured) => {
        row = captured;
      })
    );
    const result = await recordLabMilestonePass({
      itemId: ITEM,
      expectedContentVersionId: "version",
      milestoneId: "m1",
      milestoneIndex: 0,
      source: "int main(){return 0;}"
    });
    expect(result.status).toBe("saved");
    expect(row).toMatchObject({
      content_version_id: "version",
      milestone_id: "m1",
      milestone_index: 0,
      evaluation_method: "automated_tests"
    });
    expect(row.code_snapshot_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes the hash when the passing source changes", async () => {
    const hashes: unknown[] = [];
    mockedCreate.mockResolvedValue(client((captured) => hashes.push(captured.code_snapshot_hash)));
    for (const source of ["source one", "source two"]) {
      await recordLabMilestonePass({
        itemId: ITEM,
        expectedContentVersionId: "version",
        milestoneId: "m1",
        milestoneIndex: 0,
        source
      });
    }
    expect(hashes).toHaveLength(2);
    expect(hashes[0]).not.toBe(hashes[1]);
  });

  it("rejects stale versions and mismatched stable id/index before upsert", async () => {
    const captured = vi.fn();
    mockedCreate.mockResolvedValue(client(captured));
    const stale = await recordLabMilestonePass({
      itemId: ITEM,
      expectedContentVersionId: "old",
      milestoneId: "m1",
      milestoneIndex: 0,
      source: "source"
    });
    expect(stale.status).toBe("stale_definition");
    const mismatch = await recordLabMilestonePass({
      itemId: ITEM,
      expectedContentVersionId: "version",
      milestoneId: "wrong",
      milestoneIndex: 0,
      source: "source"
    });
    expect(mismatch.status).toBe("invalid_milestone");
    expect(captured).not.toHaveBeenCalled();
  });
});
