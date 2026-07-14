import { describe, expect, it } from "vitest";
import {
  filterByStatus,
  parseStatusFilter,
  statusCounts
} from "@/features/user-content/content-filters";
import type { UserContentSummary } from "@/features/user-content/user-content-queries";

function item(id: string, lifecycleStatus: UserContentSummary["lifecycleStatus"]): UserContentSummary {
  return {
    id,
    kind: "lesson",
    title: id,
    lifecycleStatus,
    recommendationEnabled: true,
    draftRevision: 1,
    updatedAt: "2026-07-14T00:00:00Z",
    publishedAt: null
  };
}

const items = [item("a", "draft"), item("b", "published"), item("c", "archived"), item("d", "draft")];

describe("content-filters (#487)", () => {
  it("defaults unknown or missing status values to 'all'", () => {
    expect(parseStatusFilter(undefined)).toBe("all");
    expect(parseStatusFilter("nonsense")).toBe("all");
    expect(parseStatusFilter("published")).toBe("published");
    expect(parseStatusFilter(["archived", "draft"])).toBe("archived");
  });

  it("filters by lifecycle status and preserves order", () => {
    expect(filterByStatus(items, "all")).toHaveLength(4);
    expect(filterByStatus(items, "draft").map((i) => i.id)).toEqual(["a", "d"]);
    expect(filterByStatus(items, "published").map((i) => i.id)).toEqual(["b"]);
    expect(filterByStatus(items, "archived").map((i) => i.id)).toEqual(["c"]);
  });

  it("counts items per status", () => {
    expect(statusCounts(items)).toEqual({ all: 4, draft: 2, published: 1, archived: 1 });
    expect(statusCounts([])).toEqual({ all: 0, draft: 0, published: 0, archived: 0 });
  });
});
