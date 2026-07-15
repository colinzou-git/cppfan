import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { getMyPublishedLabViews } from "@/features/labs/user-lab-source";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
const mockedCreate = vi.mocked(createClient);

/** Minimal Supabase stub: items list, then a payload lookup per version id. */
function dbClient(items: Array<{ id: string; current_published_version_id: string | null }>, payloads: Record<string, unknown>) {
  return {
    from: (table: string) => {
      if (table === "user_content_items") {
        const builder = {
          select: () => builder,
          eq: () => builder,
          then: (resolve: (v: { data: unknown; error: null }) => unknown) => resolve({ data: items, error: null })
        };
        return builder;
      }
      // user_content_versions
      let versionId = "";
      const vb = {
        select: () => vb,
        eq: (_col: string, val: string) => {
          versionId = val;
          return vb;
        },
        maybeSingle: async () => ({ data: payloads[versionId] ? { payload: payloads[versionId] } : null })
      };
      return vb;
    }
  } as unknown as NonNullable<Awaited<ReturnType<typeof createClient>>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreate.mockResolvedValue(null);
});

describe("getMyPublishedLabViews (#489)", () => {
  it("returns [] when there is no backend", async () => {
    expect(await getMyPublishedLabViews()).toEqual([]);
  });

  it("maps published labs to owner-scoped project cards", async () => {
    mockedCreate.mockResolvedValue(
      dbClient(
        [
          { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", current_published_version_id: "v1" },
          { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", current_published_version_id: "v2" }
        ],
        {
          v1: {
            schemaVersion: 1,
            title: "CSV lab",
            summary: "Summarize a CSV.",
            taskDescription: "Read a CSV.",
            mode: "single_task",
            evaluationMode: "self_evaluation",
            tags: ["io"]
          },
          v2: {
            schemaVersion: 1,
            title: "Shell",
            summary: "Tiny shell.",
            taskDescription: "Build a shell.",
            mode: "milestones",
            evaluationMode: "self_evaluation",
            difficulty: "advanced",
            milestones: [
              { id: "m1", title: "Read a line", instructions: "read", required: true },
              { id: "m2", title: "Run a command", instructions: "exec", required: true }
            ]
          }
        }
      )
    );
    const views = await getMyPublishedLabViews();
    expect(views).toHaveLength(2);
    expect(views[0].id).toBe("user.item.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    expect(views[0].milestones).toEqual(["Summarize a CSV."]); // single-task uses summary
    const shell = views.find((v) => v.title === "Shell")!;
    expect(shell.milestones).toEqual(["Read a line", "Run a command"]);
    expect(shell.difficulty).toBe("intermediate"); // advanced maps down for the card
  });

  it("skips items with no published version", async () => {
    mockedCreate.mockResolvedValue(dbClient([{ id: "cccccccc-cccc-cccc-cccc-cccccccccccc", current_published_version_id: null }], {}));
    expect(await getMyPublishedLabViews()).toEqual([]);
  });
});
