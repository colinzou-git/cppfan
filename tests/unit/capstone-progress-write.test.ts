import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { setMilestoneProgress } from "@/features/labs/milestone-progress";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn()
}));

function signedInClient(table: Record<string, unknown>) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } })
    },
    from: vi.fn().mockReturnValue(table)
  };
}

describe("setMilestoneProgress write resilience (#328)", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("falls back to update/insert when composite upsert is rejected during rollout", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: { code: "42P10" } });
    const updateBuilder = {
      eq: vi.fn(function (this: typeof updateBuilder) {
        return this;
      }),
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    };
    const update = vi.fn().mockReturnValue(updateBuilder);
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = signedInClient({ upsert, update, insert });
    vi.mocked(createClient).mockResolvedValue(client as never);

    await expect(
      setMilestoneProgress({ milestoneId: "note-manager.m1", status: "started" })
    ).resolves.toBe("ok");

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        milestone_id: "note-manager.m1",
        project_id: "note-manager",
        status: "started"
      })
    );
    expect(insert.mock.calls[0]?.[0]).not.toHaveProperty("verification");
  });

  it("reports unavailable instead of generic error when the progress table is not migrated", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: { code: "PGRST205" } });
    const update = vi.fn();
    const insert = vi.fn();
    const client = signedInClient({ upsert, update, insert });
    vi.mocked(createClient).mockResolvedValue(client as never);

    await expect(
      setMilestoneProgress({ milestoneId: "note-manager.m1", status: "started" })
    ).resolves.toBe("unavailable");

    expect(update).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
});
