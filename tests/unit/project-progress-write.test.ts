import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import {
  getProjectProgressForUser,
  markProjectCompleteForUser
} from "@/features/labs/project-progress";

const recordSkillEvents = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn()
}));

vi.mock("@/features/events/event-service", () => ({
  recordSkillEvents: (...args: unknown[]) => recordSkillEvents(...args)
}));

function signedInClient(table: Record<string, unknown>) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } })
    },
    from: vi.fn().mockReturnValue(table)
  };
}

describe("markProjectCompleteForUser (#439)", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
    recordSkillEvents.mockReset();
    recordSkillEvents.mockResolvedValue(true);
  });

  it("rejects an unknown project id", async () => {
    await expect(markProjectCompleteForUser({ projectId: "not-a-project" })).resolves.toBe(
      "invalid_project"
    );
  });

  it("returns signed_out when Supabase is unconfigured", async () => {
    vi.mocked(createClient).mockResolvedValue(null as never);
    await expect(markProjectCompleteForUser({ projectId: "csv-table-summarizer" })).resolves.toBe(
      "signed_out"
    );
  });

  it("returns signed_out when there is no authenticated user", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn()
    };
    vi.mocked(createClient).mockResolvedValue(client as never);
    await expect(markProjectCompleteForUser({ projectId: "csv-table-summarizer" })).resolves.toBe(
      "signed_out"
    );
  });

  it("returns unavailable when the table is not migrated", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: { code: "PGRST205" } });
    vi.mocked(createClient).mockResolvedValue(signedInClient({ upsert }) as never);
    await expect(markProjectCompleteForUser({ projectId: "csv-table-summarizer" })).resolves.toBe(
      "unavailable"
    );
  });

  it("upserts completion and records a project completion event", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValue(signedInClient({ upsert }) as never);

    await expect(markProjectCompleteForUser({ projectId: "csv-table-summarizer" })).resolves.toBe("ok");

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        project_id: "csv-table-summarizer",
        status: "completed"
      }),
      { onConflict: "user_id,project_id" }
    );
    expect(recordSkillEvents).toHaveBeenCalledWith([
      expect.objectContaining({
        eventType: "completion_submitted",
        metadata: expect.objectContaining({ project_id: "csv-table-summarizer", source: "project_lab" })
      })
    ]);
  });
});

describe("getProjectProgressForUser (#439)", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("returns an empty list when signed out", async () => {
    vi.mocked(createClient).mockResolvedValue(null as never);
    await expect(getProjectProgressForUser()).resolves.toEqual([]);
  });

  it("returns the learner's rows", async () => {
    const rows = [{ project_id: "csv-table-summarizer", status: "completed", completed_at: "now" }];
    const builder = {
      select: vi.fn(function (this: typeof builder) {
        return this;
      }),
      eq: vi.fn().mockResolvedValue({ data: rows, error: null })
    };
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn().mockReturnValue(builder)
    };
    vi.mocked(createClient).mockResolvedValue(client as never);
    await expect(getProjectProgressForUser()).resolves.toEqual(rows);
  });
});
