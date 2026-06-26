import type { ExerciseDifficulty } from "./exercise-catalog";

export type ExpandedExercisePhase = 1 | 2 | 3;

export type ExpandedExerciseSpec = {
  id: string;
  phase: ExpandedExercisePhase;
  title: string;
  difficulty: ExerciseDifficulty;
  estimatedMinutes: number;
  skillIds: string[];
  projectLab: string;
  editableFiles: string[];
  practiceFocus: "cpp-foundation" | "cpp-modern" | "interview-pattern" | "debugging-tooling";
  task: string;
  mustTest: string[];
};

/**
 * Issue #473 implementation seed.
 *
 * This is intentionally not rendered by the app yet. It is a typed, testable
 * source of truth for Claude Code to convert into canonical write-code packages
 * under exercises/<id>/, entries in exercise-catalog.ts, and Code Lab configs.
 */
export const expandedExerciseBacklog: ExpandedExerciseSpec[] = [
  {
    id: "io-grade-calculator",
    phase: 1,
    title: "I/O: grade calculator",
    difficulty: "beginner",
    estimatedMinutes: 15,
    skillIds: ["cpp.program_basics.io", "cpp.values_types.variables", "cpp.values_types.conversions", "cpp.control_flow.conditionals"],
    projectLab: "quiz-generator",
    editableFiles: ["grade_calculator.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Read a student name and three scores; print average to one decimal and a letter grade.",
    mustTest: ["A/B/F thresholds", "exact 90 and 80 boundaries", "decimal scores"]
  },
  {
    id: "loops-number-summary",
    phase: 1,
    title: "Loops: number summary",
    difficulty: "beginner",
    estimatedMinutes: 20,
    skillIds: ["cpp.control_flow.loops", "cpp.control_flow.loop_invariants", "dsa.arrays.traversal"],
    projectLab: "number-guessing-stats",
    editableFiles: ["number_summary.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Read n integers and print min, max, sum, and count of even numbers.",
    mustTest: ["empty input", "single value", "all negative", "mixed parity"]
  },
  {
    id: "functions-temperature-converter",
    phase: 1,
    title: "Functions: temperature converter",
    difficulty: "beginner",
    estimatedMinutes: 20,
    skillIds: ["cpp.functions.basics", "cpp.functions.decomposition", "cpp.values_types.conversions"],
    projectLab: "unit-converter",
    editableFiles: ["temperature_converter.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Implement Celsius/Fahrenheit conversion functions and dispatch by command.",
    mustTest: ["C command", "F command", "invalid command", "negative temperature"]
  },
  {
    id: "getline-contact-parser",
    phase: 1,
    title: "Input: whole-line contact parser",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    skillIds: ["cpp.utilities.getline_input", "cpp.utilities.stream_validation", "dsa.strings.parsing_edge_cases"],
    projectLab: "cli-flashcard-reviewer",
    editableFiles: ["contact_parser.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Parse lines in name,email,phone format and print normalized contacts.",
    mustTest: ["spaces in names", "malformed row", "empty field", "CRLF input"]
  },
  {
    id: "references-swap-clamp",
    phase: 1,
    title: "References: swap and clamp",
    difficulty: "beginner",
    estimatedMinutes: 20,
    skillIds: ["cpp.references.references", "cpp.references.parameter_passing", "cpp.references.const_correctness"],
    projectLab: "unit-converter",
    editableFiles: ["swap_clamp.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Implement swap_values(int&, int&) and clamp_in_place(int&, int low, int high).",
    mustTest: ["swap", "clamp below", "clamp above", "already in range"]
  },
  {
    id: "const-report-statistics",
    phase: 1,
    title: "Const correctness: read-only report",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    skillIds: ["cpp.references.const_correctness", "cpp.references.interface_intent", "cpp.stl.vector"],
    projectLab: "text-statistics-analyzer",
    editableFiles: ["report_statistics.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Compute sum, average, and sortedness from a const vector reference without mutation.",
    mustTest: ["empty vector", "negative values", "unsorted vector", "const object usage"]
  },
  {
    id: "pointers-safe-find",
    phase: 1,
    title: "Pointers: safe find",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    skillIds: ["cpp.references.pointers", "cpp.references.non_owning", "cpp.references.dangling", "dsa.arrays.traversal"],
    projectLab: "todo-planner",
    editableFiles: ["safe_find.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Return a pointer to the first matching vector element, or nullptr.",
    mustTest: ["found pointer mutates original", "not found", "first duplicate", "const overload"]
  },
  {
    id: "class-bank-account",
    phase: 1,
    title: "Classes: bank account invariant",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    skillIds: ["cpp.structs_classes.public_private", "cpp.structs_classes.invariants_intro", "cpp.constructors.parameterized_constructor", "cpp.structs_classes.const_methods_intro"],
    projectLab: "todo-planner",
    editableFiles: ["bank_account.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Implement a BankAccount class that prevents negative balance.",
    mustTest: ["negative initial normalizes", "reject negative deposit", "reject over-withdraw", "const getter"]
  },
  {
    id: "vector-running-median-simple",
    phase: 1,
    title: "Vector: insert and sorted median",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    skillIds: ["cpp.stl.vector", "cpp.stl.algorithms", "dsa.sorting.comparator"],
    projectLab: "text-statistics-analyzer",
    editableFiles: ["running_median.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Keep numbers sorted in a vector and compute the final median.",
    mustTest: ["odd count", "even count", "empty", "duplicates", "negative values"]
  },
  {
    id: "unordered-map-log-counter",
    phase: 1,
    title: "Hash map: log event counter",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    skillIds: ["cpp.stl.map", "dsa.hashing.lookup", "dsa.strings.parsing"],
    projectLab: "text-statistics-analyzer",
    editableFiles: ["log_counter.hpp"],
    practiceFocus: "cpp-foundation",
    task: "Count event names with a hash map and print deterministic sorted counts.",
    mustTest: ["repeated events", "empty input", "many unique events", "stable sorted output"]
  },
  {
    id: "string-valid-palindrome",
    phase: 2,
    title: "Strings: valid palindrome",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    skillIds: ["dsa.strings.palindrome", "dsa.arrays.two_pointers", "dsa.strings.case_handling"],
    projectLab: "text-statistics-analyzer",
    editableFiles: ["valid_palindrome.hpp"],
    practiceFocus: "interview-pattern",
    task: "Check whether a string is a palindrome after ignoring non-alphanumeric characters and case.",
    mustTest: ["phrase palindrome", "non-palindrome", "empty cleaned string", "digits"]
  },
  {
    id: "array-product-except-self",
    phase: 2,
    title: "Arrays: product except self",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    skillIds: ["dsa.techniques.prefix_sums", "dsa.arrays.traversal", "dsa.complexity.time_space_tradeoffs"],
    projectLab: "csv-table-summarizer",
    editableFiles: ["product_except_self.hpp"],
    practiceFocus: "interview-pattern",
    task: "Return product of all elements except the current index without division.",
    mustTest: ["normal values", "one zero", "two zeros", "negative values"]
  },
  {
    id: "sliding-window-longest-unique-substring",
    phase: 2,
    title: "Sliding window: longest unique substring",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    skillIds: ["dsa.techniques.sliding_window", "dsa.hashing.lookup", "dsa.strings.manipulation"],
    projectLab: "text-statistics-analyzer",
    editableFiles: ["longest_unique_substring.hpp"],
    practiceFocus: "interview-pattern",
    task: "Find the length of the longest substring without repeating characters in O(n).",
    mustTest: ["abcabcbb", "all same", "empty string", "repeated after long gap"]
  },
  {
    id: "binary-search-first-last",
    phase: 2,
    title: "Binary search: first and last position",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    skillIds: ["dsa.searching.binary_search", "dsa.complexity.correctness_reasoning", "cpp.stl.algorithms"],
    projectLab: "csv-table-summarizer",
    editableFiles: ["first_last_position.hpp"],
    practiceFocus: "interview-pattern",
    task: "Find the first and last index of a target in a sorted vector in O(log n).",
    mustTest: ["multiple matches", "absent target", "target at beginning", "empty vector"]
  },
  {
    id: "stack-valid-parentheses",
    phase: 2,
    title: "Stack: valid parentheses",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    skillIds: ["dsa.stacks.basic_stack", "cpp.stl.adapters", "dsa.strings.manipulation"],
    projectLab: "debugging-toolchain-lab",
    editableFiles: ["valid_parentheses.hpp"],
    practiceFocus: "interview-pattern",
    task: "Check whether bracket characters are balanced, ignoring non-bracket characters.",
    mustTest: ["nested valid", "mismatch", "starts with closer", "mixed text"]
  },
  {
    id: "linked-list-reverse",
    phase: 2,
    title: "Linked list: reverse list",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    skillIds: ["dsa.trees.linked_list", "cpp.references.pointers", "cpp.raii.ownership_boundary"],
    projectLab: "note-manager",
    editableFiles: ["reverse_list.hpp"],
    practiceFocus: "interview-pattern",
    task: "Reverse a singly linked list iteratively without allocating new nodes.",
    mustTest: ["empty list", "single node", "two nodes", "longer list"]
  },
  {
    id: "graph-course-schedule",
    phase: 2,
    title: "Graph: course schedule topological sort",
    difficulty: "advanced",
    estimatedMinutes: 45,
    skillIds: ["dsa.graphs.topological_sort", "dsa.graphs.cycle_detection", "dsa.graphs.representation"],
    projectLab: "maze-route-planner",
    editableFiles: ["course_schedule.hpp"],
    practiceFocus: "interview-pattern",
    task: "Build a prerequisite graph and determine whether all courses can be completed.",
    mustTest: ["acyclic", "cycle", "disconnected graph", "self-cycle"]
  },
  {
    id: "dp-house-robber",
    phase: 2,
    title: "DP: house robber",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    skillIds: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_design", "dsa.complexity.time_space_tradeoffs"],
    projectLab: "math-technique-playground",
    editableFiles: ["house_robber.hpp"],
    practiceFocus: "interview-pattern",
    task: "Maximize sum of non-adjacent values using O(n) time and O(1) extra memory.",
    mustTest: ["standard case", "empty", "single value", "zeros"]
  },
  {
    id: "value-semantics-deep-copy-buffer",
    phase: 3,
    title: "Value semantics: deep copy buffer",
    difficulty: "advanced",
    estimatedMinutes: 45,
    skillIds: ["cpp.value_semantics.copy", "cpp.value_semantics.deep_copy", "cpp.value_semantics.rule_of_zero_five", "cpp.tooling.sanitizers"],
    projectLab: "note-manager",
    editableFiles: ["int_buffer.hpp"],
    practiceFocus: "cpp-modern",
    task: "Implement an owning IntBuffer with deep copy, move, self-assignment safety, and no leaks.",
    mustTest: ["copy independence", "move transfers ownership", "copy assignment resizes", "self-assignment"]
  },
  {
    id: "concurrency-producer-consumer",
    phase: 3,
    title: "Concurrency: producer-consumer queue",
    difficulty: "advanced",
    estimatedMinutes: 50,
    skillIds: ["cpp.concurrency.condition_variables", "cpp.concurrency.mutexes", "cpp.concurrency.shared_state_design", "cpp.concurrency.deadlock"],
    projectLab: "task-queue-lab",
    editableFiles: ["producer_consumer_queue.hpp"],
    practiceFocus: "cpp-modern",
    task: "Implement a blocking producer-consumer queue with close, predicates, and deterministic tests.",
    mustTest: ["single producer consumer", "close drains queue", "push after close rejected", "multiple producers consumers"]
  }
];

export function getExpandedExerciseBacklog(): ExpandedExerciseSpec[] {
  return expandedExerciseBacklog;
}
