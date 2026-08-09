import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { markUserLabComplete } from "@/features/labs/user-lab-progress";
import { isCurrentUserLabVersionComplete } from "@/features/labs/user-lab-progress-state";
import { getLabForOwner } from "@/features/user-content/user-content-queries";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/features/user-content/user-content-queries", () => ({
  getLabForOwner: vi.fn()
}));

const mockedCreate = vi.mocked(createClient);
const mockedLab = vi.mocked(getLabForOwner);
const USER_ITEM = "user.item.00000000-0000-0000-0000-000000000042";

function client(opts: {
  user?: { id: string } | null;
  data?: string | null;
  error?: { code?: string } | null;
  captured?: (args: Record<string, unknown>) => void;
}) {
  return {
    auth: {
      getUser: async () => ({ data: { user: opts.user ?? { id: "u1" } } })
    },
    rpc: async (_name: string, args: Record<string, unknown>) => {
      opts.captured?.(args);
      return { data: opts.data ?? "completed", error: opts.error ?? null };
    }
  } as unknown as NonNullable<Awaited<ReturnType<typeof createClient>>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreate.mockResolvedValue(null);
  mockedLab.mockResolvedValue({
    publishedPayload: { schemaVersion: 1 } as never,
    publishedVersionId: "version-1"
  } as never);
});

describe("versioned user-lab completion persistence (#669)", () => {
  it("rejects a non-user-item id", async () => {
    expect((await markUserLabComplete({ itemId: "dsa-two-sum" })).status).toBe("invalid_project");
    expect((await markUserLabComplete({ itemId: "" })).status).toBe("invalid_project");
  });

  it("reports signed_out without a backend", async () => {
    expect((await markUserLabComplete({ itemId: USER_ITEM })).status).toBe("signed_out");
  });

  it("calls the atomic versioned RPC and accepts idempotent completion", async () => {
    let args: Record<string, unknown> | null = null;
    mockedCreate.mockResolvedValue(
      client({
        data: "already_completed",
        captured: (value) => {
          args = value;
        }
      })
    );
    const result = await markUserLabComplete({
      itemId: USER_ITEM,
      contentVersionId: "version-1",
      evaluationMode: "self_evaluation"
    });
    expect(result.status).toBe("ok");
    expect(args).toMatchObject({
      p_project_id: USER_ITEM,
      p_content_version_id: "version-1",
      p_metadata: { evaluationMode: "self_evaluation" }
    });
  });

  it("recognizes completion only for the current immutable version", () => {
    const row = {
      project_id: USER_ITEM,
      status: "completed",
      content_version_id: "version-1"
    };
    expect(isCurrentUserLabVersionComplete(row, USER_ITEM, "version-1")).toBe(true);
    expect(isCurrentUserLabVersionComplete(row, USER_ITEM, "version-2")).toBe(false);
  });
});
