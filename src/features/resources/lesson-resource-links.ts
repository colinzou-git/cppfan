import { externalResources } from "./resource-catalog";

/**
 * Resolve up to 3 curated further-reading resources for a lesson (#448), reusing
 * the `/resources` catalog (`externalResources`) — never raw URLs in prompts.
 *
 * Selection order (first non-empty wins, capped at 3):
 *   1. exact learning-item id override,
 *   2. skill-id mapping (exact, then longest matching prefix),
 *   3. module/prefix fallback (e.g. `dsa.graphs.`, `cpp.`),
 *   4. domain fallback (C++: LearnCpp + cppreference; DSA: USACO Guide +
 *      cp-algorithms + CSES).
 *
 * All ids are validated against the catalog, so a typo silently drops rather than
 * rendering a dead card; a unit test also asserts every id resolves.
 */

const MAX_RESOURCES = 3;

const VALID_IDS = new Set(externalResources.map((resource) => resource.id));

// 1. Exact learning-item id → resource ids. For lessons that want specific reading.
const ITEM_OVERRIDES: Record<string, string[]> = {
  "dsa.graphs.representation.lesson": [
    "usaco-guide-graph-traversal",
    "cses-graph-algorithms",
    "cp-algorithms-bfs"
  ]
};

// 2. Skill id → resource ids (exact skill match, then longest-prefix match below).
const SKILL_MAP: Record<string, string[]> = {
  "dsa.graphs.representation": ["usaco-guide-graph-traversal", "cses-graph-algorithms"],
  "dsa.techniques.prefix_sums": ["usaco-guide-prefix-sums", "cp-algorithms-range-queries"],
  "dsa.techniques.sliding_window": ["usaco-guide-prefix-sums", "cses-range-queries"],
  "dsa.techniques.two_pointers": ["usaco-guide-prefix-sums", "cses-sorting-searching"],
  "dsa.techniques.binary_search": ["cses-sorting-searching", "usaco-guide-complete-recursion"],
  "dsa.techniques.bit_manipulation": ["cp-algorithms-bit-manipulation", "cp-algorithms-submasks"]
};

// 3. Module/prefix fallback. Longest matching prefix wins.
const PREFIX_MAP: Array<{ prefix: string; ids: string[] }> = [
  { prefix: "dsa.graphs.", ids: ["usaco-guide-graph-traversal", "cp-algorithms-bfs", "cses-graph-algorithms"] },
  { prefix: "dsa.techniques.", ids: ["usaco-guide-prefix-sums", "cp-algorithms-range-queries", "cses-range-queries"] },
  { prefix: "dsa.trees.", ids: ["cp-algorithms-fenwick-tree", "usaco-guide-graph-traversal"] },
  { prefix: "dsa.sorting.", ids: ["cses-sorting-searching", "usaco-guide-complete-recursion"] },
  { prefix: "dsa.strings.", ids: ["cses-string-algorithms", "cp-algorithms-prefix-function"] },
  { prefix: "dsa.dp.", ids: ["usaco-guide-dynamic-programming", "cses-dynamic-programming"] },
  { prefix: "dsa.math.", ids: ["cses-mathematics", "cp-algorithms-euclid"] },
  { prefix: "dsa.geometry.", ids: ["cp-algorithms-basic-geometry", "usaco-guide-geometry-primitives"] },
  { prefix: "dsa.arrays.", ids: ["cses-sorting-searching", "usaco-guide-prefix-sums"] },
  { prefix: "dsa.strings.", ids: ["cses-string-algorithms", "cp-algorithms-prefix-function"] },
  { prefix: "dsa.math.", ids: ["cses-mathematics", "cp-algorithms-euclid"] },
  { prefix: "dsa.complexity.", ids: ["usaco-guide", "cses-sorting-searching"] },
  { prefix: "dsa.recursion.", ids: ["usaco-guide-complete-recursion", "cses-sorting-searching"] },
  { prefix: "dsa.searching.", ids: ["cses-sorting-searching", "usaco-guide-complete-recursion"] },
  { prefix: "dsa.stacks.", ids: ["usaco-guide", "cses-sorting-searching"] },
  { prefix: "dsa.hashing.", ids: ["cp-algorithms-string-hashing", "cses-string-algorithms"] },
  { prefix: "dsa.", ids: ["usaco-guide", "cp-algorithms", "cses"] },
  { prefix: "cpp.values_types.", ids: ["learncpp-initialization", "cppreference"] },
  { prefix: "cpp.control_flow.", ids: ["learncpp", "cppreference"] },
  { prefix: "cpp.functions.", ids: ["learncpp-forward-declarations", "learncpp"] },
  { prefix: "cpp.constructors.", ids: ["cppreference-rule-of-three", "cpp-core-guidelines-rule-of-zero"] },
  { prefix: "cpp.oop.", ids: ["learncpp", "cpp-core-guidelines-interfaces"] },
  { prefix: "cpp.references.", ids: ["learncpp", "cppreference"] },
  { prefix: "cpp.raii.", ids: ["cpp-core-guidelines-rule-of-zero", "cppreference-rule-of-three"] },
  { prefix: "cpp.smart_pointers.", ids: ["cpp-core-guidelines-rule-of-zero", "cppreference"] },
  { prefix: "cpp.templates.", ids: ["cppreference-concepts-library", "cppreference-constraints"] },
  { prefix: "cpp.concurrency.", ids: ["cppreference-jthread", "cppreference-atomic", "clang-thread-sanitizer"] },
  { prefix: "cpp.utilities.", ids: ["cppreference-optional", "cppreference-variant", "cppreference-tuple"] },
  { prefix: "cpp.stl.", ids: ["cppreference-vector", "cppreference-ranges-algorithms"] },
  { prefix: "cpp.value_semantics.", ids: ["cpp-core-guidelines-rule-of-zero", "cppreference-rule-of-three"] },
  { prefix: "cpp.structs_classes.", ids: ["learncpp", "cpp-core-guidelines-interfaces"] },
  { prefix: "cpp.tooling.", ids: ["cmake-tutorial", "clang-address-sanitizer"] },
  { prefix: "cpp.", ids: ["learncpp", "cppreference"] }
];

// 4. Domain fallback by top-level namespace.
const DOMAIN_FALLBACK: Array<{ prefix: string; ids: string[] }> = [
  { prefix: "cpp.", ids: ["learncpp", "cppreference"] },
  { prefix: "dsa.", ids: ["usaco-guide", "cp-algorithms", "cses"] }
];

function valid(ids: string[]): string[] {
  return ids.filter((id) => VALID_IDS.has(id)).slice(0, MAX_RESOURCES);
}

function fromSkills(skillIds: string[]): string[] {
  for (const skillId of skillIds) {
    const exact = SKILL_MAP[skillId];
    if (exact) return exact;
  }
  // Longest skill-prefix match across the skill map keys.
  let best: { len: number; ids: string[] } | null = null;
  for (const skillId of skillIds) {
    for (const [key, ids] of Object.entries(SKILL_MAP)) {
      if (skillId.startsWith(`${key}.`) && (!best || key.length > best.len)) {
        best = { len: key.length, ids };
      }
    }
  }
  return best ? best.ids : [];
}

function longestPrefix(table: Array<{ prefix: string; ids: string[] }>, keys: string[]): string[] {
  let best: { len: number; ids: string[] } | null = null;
  for (const key of keys) {
    for (const entry of table) {
      if (key.startsWith(entry.prefix) && (!best || entry.prefix.length > best.len)) {
        best = { len: entry.prefix.length, ids: entry.ids };
      }
    }
  }
  return best ? best.ids : [];
}

/** Ordered, validated resource ids for a lesson; empty when nothing maps. */
export function getLessonResourceIds(itemId: string, skillIds: string[]): string[] {
  const override = ITEM_OVERRIDES[itemId];
  if (override) return valid(override);

  const skillMatch = fromSkills(skillIds);
  if (skillMatch.length > 0) return valid(skillMatch);

  // Prefix fallback keyed by skill ids, then by the item id itself.
  const keys = [...skillIds, itemId];
  const prefixMatch = longestPrefix(PREFIX_MAP, keys);
  if (prefixMatch.length > 0) return valid(prefixMatch);

  const domainMatch = longestPrefix(DOMAIN_FALLBACK, keys);
  return valid(domainMatch);
}
