import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { clearPlacement, runPlacement } from "@/features/placement/placement-service";

const recordSkillEvents = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn()
}));

vi.mock("@/features/events/event-service", () => ({
  recordSkillEvents: (...args: unknown[]) => recordSkillEvents(...args)
}));

vi.mock("@/features/learning-items/attempt-service", () => ({
  gradeViaRpc: vi.fn().mockResolvedValue({ status: "unavailable" }),
  getGradingChoices: vi.fn().mockResolvedValue([])
}));

function signedInTable(table: Record<string, unknown>) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } })
    },
    from: vi.fn().mockReturnValue(table)
  };
}

describe("placement-service events (#125)", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
    recordSkillEvents.mockReset();
    recordSkillEvents.mockResolvedValue(true);
  });

  it("records placement started and completed when signed-in results persist", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValue(signedInTable({ upsert }) as never);

    await expect(runPlacement({})).resolves.toMatchObject({ status: "ok", persisted: true });

    expect(recordSkillEvents).toHaveBeenCalledWith([
      expect.objectContaining({ eventType: "placement_started" })
    ]);
    expect(recordSkillEvents).toHaveBeenCalledWith([
      expect.objectContaining({ eventType: "placement_completed" })
    ]);
  });

  it("records placement reset after deleting signed-in results", async () => {
    const deleteBuilder = {
      eq: vi.fn().mockResolvedValue({ error: null })
    };
    const del = vi.fn().mockReturnValue(deleteBuilder);
    vi.mocked(createClient).mockResolvedValue(signedInTable({ delete: del }) as never);

    await expect(clearPlacement()).resolves.toEqual({ status: "ok" });

    expect(recordSkillEvents).toHaveBeenCalledWith([
      expect.objectContaining({ eventType: "placement_reset" })
    ]);
  });
});
