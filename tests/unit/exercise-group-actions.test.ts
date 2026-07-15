import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import {
  createExerciseGroup,
  renameExerciseGroup,
  deleteExerciseGroup
} from "@/features/user-content/exercise-group-actions";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const mockedCreate = vi.mocked(createClient);

/** A minimal Supabase stub whose insert/update/delete chains resolve to `result`. */
function tableClient(opts: {
  user?: { id: string } | null;
  result?: { data?: unknown; error?: unknown };
  captured?: (payload: Record<string, unknown>) => void;
}) {
  const result = opts.result ?? { data: null, error: null };
  const terminal = {
    select: () => terminal,
    single: async () => result,
    maybeSingle: async () => result,
    eq: () => terminal
  };
  return {
    auth: { getUser: async () => ({ data: { user: opts.user ?? { id: "u1" } } }) },
    from: () => ({
      insert: (payload: Record<string, unknown>) => {
        opts.captured?.(payload);
        return terminal;
      },
      update: (payload: Record<string, unknown>) => {
        opts.captured?.(payload);
        return terminal;
      },
      delete: () => ({ eq: async () => result })
    })
  } as unknown as NonNullable<Awaited<ReturnType<typeof createClient>>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreate.mockResolvedValue(null);
});

describe("createExerciseGroup (#488)", () => {
  it("rejects an empty name before touching the backend", async () => {
    const result = await createExerciseGroup({ name: "   " });
    expect(result.status).toBe("invalid");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("reports unconfigured with no backend", async () => {
    const result = await createExerciseGroup({ name: "Sorting" });
    expect(result.status).toBe("unconfigured");
  });

  it("inserts a trimmed group scoped to the signed-in user", async () => {
    let captured: Record<string, unknown> | null = null;
    mockedCreate.mockResolvedValue(
      tableClient({
        user: { id: "user-9" },
        captured: (p) => {
          captured = p;
        },
        result: {
          data: {
            id: "g1",
            name: "Sorting",
            description: null,
            order_index: 0,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z"
          },
          error: null
        }
      })
    );
    const result = await createExerciseGroup({ name: "  Sorting  ", description: "  " });
    expect(result).toMatchObject({ status: "ok", group: { id: "g1", name: "Sorting" } });
    expect(captured).toMatchObject({ user_id: "user-9", name: "Sorting", description: null });
  });
});

describe("renameExerciseGroup (#488)", () => {
  it("rejects an empty id", async () => {
    const result = await renameExerciseGroup({ id: "" });
    expect(result.status).toBe("invalid");
  });

  it("rejects an empty new name", async () => {
    const result = await renameExerciseGroup({ id: "g1", name: "  " });
    expect(result.status).toBe("invalid");
  });

  it("maps a missing row to not_found", async () => {
    mockedCreate.mockResolvedValue(tableClient({ result: { data: null, error: null } }));
    const result = await renameExerciseGroup({ id: "g1", name: "Renamed" });
    expect(result.status).toBe("not_found");
  });
});

describe("deleteExerciseGroup (#488)", () => {
  it("errors on an empty id", async () => {
    const result = await deleteExerciseGroup("");
    expect(result.status).toBe("error");
  });

  it("returns ok when the delete succeeds", async () => {
    mockedCreate.mockResolvedValue(tableClient({ result: { data: null, error: null } }));
    const result = await deleteExerciseGroup("g1");
    expect(result.status).toBe("ok");
  });
});
