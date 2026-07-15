import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { markUserLabComplete } from "@/features/labs/user-lab-progress";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/features/events/event-service", () => ({ recordSkillEvents: vi.fn(async () => true) }));
const mockedCreate = vi.mocked(createClient);

const USER_ITEM = "user.item.00000000-0000-0000-0000-000000000042";

function client(opts: { user?: { id: string } | null; error?: unknown; captured?: (row: Record<string, unknown>) => void }) {
  return {
    auth: { getUser: async () => ({ data: { user: opts.user ?? { id: "u1" } } }) },
    from: () => ({
      upsert: async (row: Record<string, unknown>) => {
        opts.captured?.(row);
        return { error: opts.error ?? null };
      }
    })
  } as unknown as NonNullable<Awaited<ReturnType<typeof createClient>>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreate.mockResolvedValue(null);
});

describe("markUserLabComplete (#489)", () => {
  it("rejects a non-user-item id", async () => {
    expect((await markUserLabComplete({ itemId: "dsa-two-sum" })).status).toBe("invalid_project");
    expect((await markUserLabComplete({ itemId: "" })).status).toBe("invalid_project");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("reports signed_out without a backend", async () => {
    expect((await markUserLabComplete({ itemId: USER_ITEM })).status).toBe("signed_out");
  });

  it("upserts a completed row keyed by the item id for the signed-in user", async () => {
    let row: Record<string, unknown> | null = null;
    mockedCreate.mockResolvedValue(client({ user: { id: "user-9" }, captured: (r) => (row = r) }));
    const result = await markUserLabComplete({ itemId: USER_ITEM });
    expect(result.status).toBe("ok");
    expect(row).toMatchObject({ user_id: "user-9", project_id: USER_ITEM, status: "completed" });
  });
});
