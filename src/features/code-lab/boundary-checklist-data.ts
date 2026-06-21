import type { BoundaryChecklist } from "./boundary-checklist-types";

/**
 * Initial high-value boundary-case checklists (#411). Kept small and curated.
 * Each is mapped to one or more skill ids; the Code Lab resolves checklists from
 * an item's skill tags and/or explicit `boundaryChecklistIds`.
 */
export const BOUNDARY_CHECKLISTS: BoundaryChecklist[] = [
  {
    id: "io_basics",
    title: "Input/output edge cases",
    skillIds: [
      "cpp.program_basics.io",
      "cpp.program_basics.structure",
      "cpp.program_basics.statements_comments"
    ],
    items: [
      {
        id: "empty_input",
        label: "empty input",
        explanation: "What happens when there is no input at all?",
        sampleInput: ""
      },
      {
        id: "single_line",
        label: "a single line",
        sampleInput: "hello"
      },
      {
        id: "trailing_whitespace",
        label: "trailing spaces / newline",
        explanation: "Does extra whitespace change your output?",
        sampleInput: "hello   "
      },
      {
        id: "long_line",
        label: "a very long line",
        sampleInput: "the quick brown fox jumps over the lazy dog again and again"
      }
    ]
  },
  {
    id: "arrays_traversal",
    title: "Array / vector traversal",
    skillIds: ["dsa.arrays.traversal", "cpp.vector"],
    items: [
      { id: "empty", label: "empty array", relatedErrorTags: ["cpp.vector.out_of_bounds"] },
      { id: "one_element", label: "one element" },
      { id: "first_last", label: "first and last element", relatedErrorTags: ["cpp.loop.off_by_one"] },
      { id: "duplicates", label: "duplicate values" }
    ]
  },
  {
    id: "binary_search",
    title: "Binary search boundaries",
    skillIds: ["dsa.searching.binary_search_on_array", "dsa.binary_search"],
    items: [
      { id: "empty", label: "empty input" },
      { id: "one_element", label: "one element" },
      { id: "target_before_first", label: "target before first element" },
      { id: "target_after_last", label: "target after last element" },
      {
        id: "duplicates",
        label: "duplicate values (first/last occurrence)",
        relatedErrorTags: ["dsa.binary_search.boundary_update"]
      },
      {
        id: "shrink",
        label: "lo/hi always shrink (no infinite loop)",
        explanation: "Every iteration must reduce the search range.",
        relatedErrorTags: ["dsa.binary_search.boundary_update", "cpp.loop.off_by_one"]
      }
    ]
  },
  {
    id: "graph_bfs",
    title: "BFS edge cases",
    skillIds: ["dsa.graphs.bfs"],
    items: [
      { id: "empty", label: "empty graph" },
      { id: "single_node", label: "single node" },
      { id: "disconnected", label: "disconnected components" },
      {
        id: "cycle",
        label: "cycles (visited set prevents re-enqueue)",
        relatedErrorTags: ["dsa.graphs.missing_visited"]
      }
    ]
  },
  {
    id: "graph_dfs",
    title: "DFS edge cases",
    skillIds: ["dsa.graphs.dfs"],
    items: [
      { id: "single_node", label: "single node" },
      { id: "self_loop", label: "self-loop" },
      {
        id: "cycle",
        label: "cycles (visited set prevents infinite recursion)",
        relatedErrorTags: ["dsa.graphs.missing_visited", "cpp.recursion.missing_base_case"]
      },
      { id: "deep", label: "deep / long path (stack depth)" }
    ]
  },
  {
    id: "dp_base_case",
    title: "DP base case & state",
    skillIds: ["dsa.dp.state_definition", "dsa.dp.base_case", "dsa.dp"],
    items: [
      {
        id: "smallest",
        label: "smallest input (n = 0 / n = 1)",
        relatedErrorTags: ["dsa.dp.bad_base_case"]
      },
      {
        id: "state_covers",
        label: "state covers all subproblems",
        relatedErrorTags: ["dsa.dp.bad_state_definition"]
      },
      { id: "overflow", label: "large input (overflow / size)" }
    ]
  }
];
