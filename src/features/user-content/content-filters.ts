import type { UserContentSummary } from "./user-content-queries";

/** Status tabs shown on /my-content. "all" is the default. */
export const CONTENT_STATUS_FILTERS = ["all", "draft", "published", "archived"] as const;
export type ContentStatusFilter = (typeof CONTENT_STATUS_FILTERS)[number];

export const STATUS_FILTER_LABELS: Record<ContentStatusFilter, string> = {
  all: "All",
  draft: "Drafts",
  published: "Published",
  archived: "Archived"
};

/** Coerce an untrusted query value to a known status filter, defaulting to "all". */
export function parseStatusFilter(raw: string | string[] | undefined): ContentStatusFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (CONTENT_STATUS_FILTERS as readonly string[]).includes(value ?? "")
    ? (value as ContentStatusFilter)
    : "all";
}

/** Filter the owner's items by lifecycle status. Order is preserved (the query
 * already returns most-recently-edited first). */
export function filterByStatus(
  items: UserContentSummary[],
  filter: ContentStatusFilter
): UserContentSummary[] {
  if (filter === "all") {
    return items;
  }
  return items.filter((item) => item.lifecycleStatus === filter);
}

/** Per-tab counts for the filter chips. */
export function statusCounts(items: UserContentSummary[]): Record<ContentStatusFilter, number> {
  const counts: Record<ContentStatusFilter, number> = { all: items.length, draft: 0, published: 0, archived: 0 };
  for (const item of items) {
    if (item.lifecycleStatus === "draft" || item.lifecycleStatus === "published" || item.lifecycleStatus === "archived") {
      counts[item.lifecycleStatus] += 1;
    }
  }
  return counts;
}
