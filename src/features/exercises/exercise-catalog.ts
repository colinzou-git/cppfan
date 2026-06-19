// Typed write-code exercise catalog for the web app (#128 / #81). Mirrors the
// canonical exercises/<id>/exercise.json packages so the app can browse and link
// exercises from skills and labs. The shell scripts (prepare/test/verify-all)
// remain the source of truth for building/running; this is the read model. A
// unit test asserts this catalog stays in parity with the on-disk JSON and that
// every referenced skill / editable file / required test actually exists.

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";

export type Exercise = {
  id: string;
  title: string;
  skillIds: string[];
  difficulty: ExerciseDifficulty;
  estimatedMinutes: number;
  editableFiles: string[];
  requiredTests: string[];
  hints: string[];
  projectLab: string;
};

export const exerciseCatalog: Exercise[] = [
  {
    id: "dsa-two-sum-sorted",
    title: "DSA: two-sum on a sorted array",
    skillIds: ["dsa.arrays.two_pointers", "dsa.complexity.big_o"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["two_sum.hpp"],
    requiredTests: [
      "test_middle_pair",
      "test_smallest_i_pair",
      "test_first_two",
      "test_no_solution",
      "test_too_small_input",
      "test_handles_negatives"
    ],
    hints: [
      "Start one index at 0 and another at nums.size() - 1.",
      "If the sum is too small, move the low index right; if too big, move the high index left.",
      "Stop when the indices meet; if you never hit the target, return {-1, -1}."
    ],
    projectLab: "csv-table-summarizer"
  },
  {
    id: "raii-scoped-array",
    title: "RAII: a move-only scoped array",
    skillIds: ["cpp.raii.resource_lifetime", "cpp.raii.destructor_cleanup", "cpp.value_semantics.move"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["scoped_array.hpp"],
    requiredTests: ["test_basic_storage", "test_live_count_returns_to_baseline", "test_move_transfers_ownership"],
    hints: [
      "Allocate with `new int[size]()` so elements start at 0; free with `delete[]`.",
      "Increment a static counter in the constructor and decrement it in the destructor — but only when this object still owns memory.",
      "After moving, set the source's pointer to nullptr and size to 0 so its destructor does not double-free or double-decrement."
    ],
    projectLab: "note-manager"
  },
  {
    id: "stl-text-stats",
    title: "STL: text statistics",
    skillIds: ["cpp.stl.map", "cpp.stl.algorithms", "dsa.strings.parsing"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["text_stats.hpp"],
    requiredTests: [
      "test_counts_and_lowercasing",
      "test_empty_text",
      "test_top_n_orders_by_count_then_word",
      "test_top_n_clamps_to_distinct"
    ],
    hints: [
      "Feed the text into a std::istringstream and read words with `>>` — it splits on whitespace for you.",
      "Lowercase each character with std::tolower (cast to unsigned char first to avoid UB).",
      "For top_n, copy the map into a vector and std::sort with a comparator: count descending, then word ascending."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "trie-autocomplete",
    title: "Strings: trie autocomplete",
    skillIds: ["dsa.strings.trie", "dsa.strings.char_frequency", "dsa.strings.case_handling"],
    difficulty: "advanced",
    estimatedMinutes: 35,
    editableFiles: ["autocomplete.hpp"],
    requiredTests: [
      "test_exact_membership",
      "test_prefix_suggestions_sorted",
      "test_limit_and_missing_prefix",
      "test_insert_adds_word_without_duplicates",
      "test_empty_prefix_returns_dictionary_order"
    ],
    hints: [
      "Each trie edge represents one character; walking a prefix lands on the subtree of completions.",
      "Mark terminal nodes so exact membership differs from just being a prefix.",
      "Traverse children in sorted key order so suggestions are deterministic.",
      "Stop collecting suggestions once you reach the requested limit."
    ],
    projectLab: "dictionary-autocomplete"
  },
  {
    id: "tooling-status-parser",
    title: "Tooling: status parser with tests",
    skillIds: [
      "cpp.tooling.debugging_method",
      "cpp.tooling.unit_testing",
      "cpp.tooling.regression_testing",
      "cpp.tooling.warnings",
      "cpp.tooling.sanitizers",
      "cpp.tooling.cmake"
    ],
    difficulty: "intermediate",
    estimatedMinutes: 35,
    editableFiles: ["status_parser.hpp"],
    requiredTests: [
      "test_parses_ok_status",
      "test_parses_error_status",
      "test_rejects_missing_message_boundary",
      "test_rejects_negative_code_adversarial",
      "test_regression_preserves_message_spaces"
    ],
    hints: [
      "Parse the status word, numeric code, and the rest of the line as the message.",
      "Treat malformed input as {false, -1, \"malformed\"}; validate negative codes separately.",
      "Keep the message after the code intact except for one leading separator space."
    ],
    projectLab: "debugging-toolchain-lab"
  },
  {
    id: "filesystem-inventory",
    title: "Utilities: filesystem inventory",
    skillIds: ["cpp.utilities.filesystem", "cpp.utilities.file_io", "cpp.utilities.stream_validation"],
    difficulty: "intermediate",
    estimatedMinutes: 35,
    editableFiles: ["inventory.hpp"],
    requiredTests: [
      "test_missing_root_is_empty",
      "test_rejects_plain_file_root",
      "test_counts_nested_files_and_directories",
      "test_counts_extensions_and_no_extension",
      "test_empty_directory"
    ],
    hints: [
      "Check exists(root, ec) and is_directory(root, ec) before iterating.",
      "Use recursive_directory_iterator with directory_options::skip_permission_denied and increment(error_code).",
      "Use entry.is_regular_file(ec), entry.is_directory(ec), and entry.file_size(ec) instead of parsing path text.",
      "path.extension().string() is empty for extensionless files; store those as \"(none)\"."
    ],
    projectLab: "directory-inventory-reporter"
  },
  {
    id: "concurrency-task-queue",
    title: "Concurrency: bounded task queue",
    skillIds: [
      "cpp.concurrency.threads",
      "cpp.concurrency.mutexes",
      "cpp.concurrency.condition_variables",
      "cpp.concurrency.deadlock",
      "cpp.concurrency.shared_state_design"
    ],
    difficulty: "advanced",
    estimatedMinutes: 45,
    editableFiles: ["bounded_task_queue.hpp"],
    requiredTests: [
      "test_fifo_single_thread",
      "test_close_rejects_new_work_and_drains_existing",
      "test_blocked_consumer_gets_pushed_task_without_sleep",
      "test_multiple_producers_consumers_exactly_once"
    ],
    hints: [
      "Protect the queue and closed flag with one mutex.",
      "Use condition_variable::wait with predicates; no sleeps are needed.",
      "Notify a producer after pop frees capacity and notify a consumer after push adds work.",
      "close() should wake all waiting threads and let consumers drain queued work."
    ],
    projectLab: "task-queue-lab"
  },
  {
    id: "graph-maze-shortest-path",
    title: "Graph: shortest path through a maze",
    skillIds: ["dsa.graphs.bfs", "dsa.graphs.connected_components", "dsa.graphs.shortest_path"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["maze_route.hpp"],
    requiredTests: [
      "test_shortest_route_exists",
      "test_start_is_goal",
      "test_unreachable_goal",
      "test_rejects_missing_start_or_goal",
      "test_handles_single_corridor"
    ],
    hints: [
      "Treat every non-wall cell as a graph vertex.",
      "Use a queue for BFS and mark a cell visited when you enqueue it.",
      "The first time BFS reaches G, that distance is the shortest number of moves."
    ],
    projectLab: "maze-route-planner"
  }
];

export function getExercises(): Exercise[] {
  return exerciseCatalog;
}

export function getExerciseById(id: string): Exercise | null {
  return exerciseCatalog.find((exercise) => exercise.id === id) ?? null;
}

/** Exercises that practice a given skill, for linking from skills and labs. */
export function getExercisesForSkill(skillId: string): Exercise[] {
  return exerciseCatalog.filter((exercise) => exercise.skillIds.includes(skillId));
}
