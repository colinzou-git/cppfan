import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { getMyPublishedInterviewViews } from "@/features/interview/user-interview-source";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
const mockedCreate = vi.mocked(createClient);

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

describe("getMyPublishedInterviewViews (#490)", () => {
  it("returns [] when there is no backend", async () => {
    expect(await getMyPublishedInterviewViews()).toEqual([]);
  });

  it("maps published problems to owner-scoped catalog views (no answer-bearing fields)", async () => {
    mockedCreate.mockResolvedValue(
      dbClient(
        [{ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", current_published_version_id: "v1" }],
        {
          v1: {
            schemaVersion: 1,
            title: "Two Sum",
            statement: "Return indices summing to target.",
            evaluationMode: "judge",
            difficulty: "hard",
            roleRelevance: "systems",
            patternTags: ["hashing"],
            referenceSolution: "SECRET",
            tests: [{ name: "h", input: "x", expectedOutput: "y", hidden: true }]
          }
        }
      )
    );
    const views = await getMyPublishedInterviewViews();
    expect(views).toHaveLength(1);
    expect(views[0].id).toBe("user.item.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    expect(views[0].difficulty).toBe("hard");
    expect(views[0].patternTags).toEqual(["hashing"]);
    expect(JSON.stringify(views[0])).not.toContain("SECRET");
  });

  it("skips items with no published version", async () => {
    mockedCreate.mockResolvedValue(dbClient([{ id: "b", current_published_version_id: null }], {}));
    expect(await getMyPublishedInterviewViews()).toEqual([]);
  });
});
