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
    id: "io-grade-calculator",
    title: "I/O: grade calculator",
    skillIds: [
      "cpp.program_basics.io",
      "cpp.values_types.variables",
      "cpp.values_types.conversions",
      "cpp.control_flow.conditionals"
    ],
    difficulty: "beginner",
    estimatedMinutes: 15,
    editableFiles: ["grade_calculator.hpp"],
    requiredTests: [
      "test_letter_a",
      "test_boundary_b",
      "test_boundary_d",
      "test_letter_f",
      "test_exact_ninety_is_a",
      "test_just_below_sixty_is_f",
      "test_decimal_scores"
    ],
    hints: [
      "Compute the average as a double: (a + b + c) / 3.0.",
      "Check thresholds from highest to lowest (90, then 80, 70, 60).",
      "The thresholds are inclusive — exactly 90.0 is an 'A'."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "strings-valid-palindrome",
    title: "Strings: valid palindrome",
    skillIds: ["dsa.strings.palindrome", "dsa.arrays.two_pointers", "dsa.strings.case_handling"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["palindrome.hpp"],
    requiredTests: [
      "test_simple_palindrome",
      "test_not_a_palindrome",
      "test_ignores_case",
      "test_ignores_punctuation_and_spaces",
      "test_empty_and_single",
      "test_digits"
    ],
    hints: [
      "Walk two indices from the ends toward the middle.",
      "Skip a character when it is not alphanumeric (std::isalnum).",
      "Compare the lowercased characters (std::tolower) on a cast to unsigned char."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "dsa-binary-search-lower-bound",
    title: "DSA: binary search lower bound",
    skillIds: ["dsa.searching.binary_search", "dsa.arrays.indexing"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["lower_bound.hpp"],
    requiredTests: [
      "test_present_unique",
      "test_absent_between",
      "test_above_all",
      "test_duplicates_first_match",
      "test_empty"
    ],
    hints: [
      "Search a half-open range [lo, hi) where hi starts at nums.size().",
      "Compute mid as lo + (hi - lo) / 2 to avoid overflow.",
      "Move lo to mid + 1 when nums[mid] < target; otherwise move hi to mid."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "strings-anagram-check",
    title: "Strings: anagram check",
    skillIds: ["dsa.strings.char_frequency", "dsa.strings.hashing"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["anagram.hpp"],
    requiredTests: [
      "test_basic_anagrams",
      "test_not_anagrams",
      "test_ignores_case",
      "test_ignores_spaces",
      "test_empty_and_spaces",
      "test_counts_matter"
    ],
    hints: [
      "Tally each character's frequency for the first string.",
      "Subtract the second string's characters from the same tally.",
      "Skip spaces and lowercase letters before counting; the strings are anagrams when every count returns to zero."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "dsa-max-subarray-sum",
    title: "DSA: maximum subarray sum",
    skillIds: ["dsa.techniques.dp_design", "dsa.techniques.prefix_sums"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["max_subarray.hpp"],
    requiredTests: [
      "test_mixed",
      "test_all_positive",
      "test_all_negative",
      "test_single_element",
      "test_large_values_no_overflow"
    ],
    hints: [
      "Track the best subarray sum ending at the current index.",
      "If the running sum is positive, extend it; otherwise restart at the current element.",
      "Keep a separate overall maximum, and use long long to avoid 32-bit overflow."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "stl-vector-stats",
    title: "STL: vector statistics",
    skillIds: ["cpp.stl.vector", "cpp.stl.algorithms"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["vector_stats.hpp"],
    requiredTests: [
      "test_basic",
      "test_single",
      "test_negatives",
      "test_fractional_mean",
      "test_large_sum_no_overflow"
    ],
    hints: [
      "std::min_element / std::max_element return iterators — dereference them.",
      "std::accumulate with a 0LL seed keeps the sum in a long long.",
      "Divide the sum by nums.size() with a double cast for the mean."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "cpp-rational-reduce",
    title: "C++: reduce a fraction",
    skillIds: ["cpp.structs_classes.invariants_intro"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["rational.hpp"],
    requiredTests: [
      "test_basic_reduction",
      "test_already_reduced",
      "test_negative_numerator",
      "test_negative_denominator_moves_sign",
      "test_both_negative_is_positive",
      "test_zero_numerator",
      "test_reduces_to_integer"
    ],
    hints: [
      "If the denominator is negative, flip the sign of both numerator and denominator.",
      "Compute the greatest common divisor with the Euclidean algorithm on absolute values.",
      "Divide both parts by the gcd; gcd(0, d) is d, so 0/d becomes 0/1."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "dsa-valid-parentheses",
    title: "DSA: valid parentheses",
    skillIds: ["dsa.stacks.basic_stack"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["parentheses.hpp"],
    requiredTests: [
      "test_simple_balanced",
      "test_unbalanced",
      "test_empty",
      "test_ignores_other_chars",
      "test_closing_without_open"
    ],
    hints: [
      "Push every opening bracket onto a stack.",
      "On a closing bracket, the stack must be non-empty and its top must be the matching opener.",
      "After scanning the whole string, the stack must be empty for a balanced result."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "dsa-first-unique-char",
    title: "DSA: first unique character",
    skillIds: ["dsa.hashing.lookup", "dsa.strings.char_frequency"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["first_unique.hpp"],
    requiredTests: [
      "test_first_char_unique",
      "test_later_unique",
      "test_none_unique",
      "test_empty_and_single",
      "test_unique_at_end",
      "test_mixed_chars"
    ],
    hints: [
      "First pass: count how many times each character appears.",
      "Second pass: return the index of the first character whose count is 1.",
      "Return -1 when no character is unique (or the string is empty)."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "strings-longest-unique-substring",
    title: "Strings: longest unique substring",
    skillIds: ["dsa.techniques.sliding_window", "dsa.hashing.lookup"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["longest_unique.hpp"],
    requiredTests: [
      "test_classic",
      "test_all_same",
      "test_all_unique",
      "test_empty_and_single",
      "test_repeat_resets_window",
      "test_with_spaces_and_digits"
    ],
    hints: [
      "Keep a sliding window [start, i] and the last index where each character was seen.",
      "When the current character was last seen at or after start, move start to one past it.",
      "The answer is the largest window width (i - start + 1) over the whole scan."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "dsa-merge-sorted-arrays",
    title: "DSA: merge two sorted arrays",
    skillIds: ["dsa.arrays.two_pointers", "dsa.arrays.traversal"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["merge_sorted.hpp"],
    requiredTests: [
      "test_basic",
      "test_one_empty",
      "test_both_empty",
      "test_duplicates",
      "test_uneven_lengths",
      "test_negatives"
    ],
    hints: [
      "Walk an index through each input, appending the smaller front element.",
      "When values tie, take from `a` first to keep the merge stable.",
      "After one input is exhausted, append whatever remains of the other."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "dsa-count-set-bits",
    title: "DSA: count set bits",
    skillIds: ["dsa.math.bit_manipulation"],
    difficulty: "beginner",
    estimatedMinutes: 15,
    editableFiles: ["count_bits.hpp"],
    requiredTests: [
      "test_zero",
      "test_powers_of_two",
      "test_small_values",
      "test_all_bits",
      "test_mixed"
    ],
    hints: [
      "Brian Kernighan's trick: n &= (n - 1) clears the lowest set bit.",
      "Count how many times you can clear a bit before n becomes 0.",
      "Work on the unsigned value directly — no string conversion needed."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "dsa-sort-by-frequency",
    title: "DSA: sort by frequency",
    skillIds: ["dsa.sorting.comparator", "dsa.hashing.lookup"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["sort_by_frequency.hpp"],
    requiredTests: [
      "test_basic",
      "test_all_same_frequency_orders_by_value",
      "test_ties_broken_by_value",
      "test_empty_and_single",
      "test_negatives"
    ],
    hints: [
      "Count occurrences first with a map from value to count.",
      "std::sort with a comparator: order by ascending frequency first.",
      "Break frequency ties by the value itself (ascending)."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "cpp-string-split",
    title: "C++: split a string",
    skillIds: ["dsa.strings.parsing", "cpp.stl.string"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["split.hpp"],
    requiredTests: [
      "test_basic",
      "test_empty_fields",
      "test_leading_trailing_delims",
      "test_no_delim",
      "test_empty_string",
      "test_other_delimiter"
    ],
    hints: [
      "Accumulate characters into a current field string.",
      "On a delimiter, push the current field and clear it.",
      "Push the final field once after the loop so empty trailing fields are kept."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "dsa-move-zeroes",
    title: "DSA: move zeroes to the end",
    skillIds: ["dsa.arrays.two_pointers", "dsa.arrays.traversal"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["move_zeroes.hpp"],
    requiredTests: [
      "test_basic",
      "test_no_zeroes",
      "test_all_zeroes",
      "test_preserves_order",
      "test_empty_and_single",
      "test_negatives_kept"
    ],
    hints: [
      "Keep a write index that trails a read scan over the values.",
      "Copy each non-zero value to the write index and advance it.",
      "After the scan, fill the remaining positions with zeroes."
    ],
    projectLab: "math-technique-playground"
  },
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
  },
  {
    id: "math-combination-generator",
    title: "Math: combination generator",
    skillIds: [
      "dsa.math.counting_principle",
      "dsa.math.generate_combinations",
      "dsa.math.bitmask_techniques"
    ],
    difficulty: "advanced",
    estimatedMinutes: 35,
    editableFiles: ["combination_generator.hpp"],
    requiredTests: [
      "test_count_small_combinations",
      "test_rejects_impossible_counts",
      "test_generates_lexicographic_combinations",
      "test_handles_empty_selection",
      "test_subset_from_mask_decodes_flags",
      "test_generated_count_matches_pascal_count"
    ],
    hints: [
      "For counting, use Pascal's recurrence C(n,k)=C(n-1,k-1)+C(n-1,k) with base cases k=0 and k=n.",
      "For generation, keep a current vector and recurse from an advancing start index.",
      "Undo each choice with pop_back before trying the next element.",
      "For subset_from_mask, include values[i] when bit i of mask is 1."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "loops-number-summary",
    title: "Loops: number summary in one pass",
    skillIds: ["cpp.control_flow.loops", "cpp.control_flow.loop_invariants", "dsa.arrays.traversal"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["number_summary.hpp"],
    requiredTests: [
      "test_basic_summary",
      "test_single_element",
      "test_empty_input",
      "test_handles_negatives",
      "test_counts_even_numbers",
      "test_min_and_max"
    ],
    hints: [
      "Handle the empty vector first and return {0, 0, 0, 0, 0}.",
      "Seed both min and max from nums[0] before the loop, then compare each value.",
      "Increment even_count when v % 2 == 0; this works for negative even numbers too."
    ],
    projectLab: "number-guessing-stats"
  },
  {
    id: "functions-temperature-converter",
    title: "Functions: temperature converter",
    skillIds: ["cpp.functions.basics", "cpp.functions.decomposition", "cpp.values_types.conversions"],
    difficulty: "beginner",
    estimatedMinutes: 15,
    editableFiles: ["temperature_converter.hpp"],
    requiredTests: [
      "test_freezing_point",
      "test_boiling_point",
      "test_negative_temperatures",
      "test_kelvin_conversions",
      "test_round_trip"
    ],
    hints: [
      "Use floating-point literals (9.0 / 5.0) so you do not get integer division.",
      "-40 is the temperature where Celsius and Fahrenheit are equal — a handy check.",
      "Kelvin is just Celsius shifted by 273.15, so the two Kelvin functions are inverses."
    ],
    projectLab: "unit-converter"
  },
  {
    id: "getline-contact-parser",
    title: "Parsing: contact line parser",
    skillIds: ["cpp.utilities.getline_input", "cpp.utilities.stream_validation", "dsa.strings.parsing_edge_cases"],
    difficulty: "beginner",
    estimatedMinutes: 25,
    editableFiles: ["contact_parser.hpp"],
    requiredTests: [
      "test_parses_clean_line",
      "test_trims_surrounding_spaces",
      "test_rejects_wrong_field_count",
      "test_rejects_email_without_at",
      "test_rejects_empty_field"
    ],
    hints: [
      "Scan the line character by character, splitting into a new field on each comma.",
      "Trim with find_first_not_of / find_last_not_of over \" \\t\\r\\n\".",
      "Only mark valid when there are exactly three non-empty fields and the email contains '@'."
    ],
    projectLab: "csv-table-summarizer"
  },
  {
    id: "references-swap-clamp",
    title: "References: swap and clamp",
    skillIds: ["cpp.references.references", "cpp.references.parameter_passing", "cpp.references.const_correctness"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["swap_clamp.hpp"],
    requiredTests: [
      "test_swap_exchanges_values",
      "test_swap_equal_values",
      "test_clamp_below_range",
      "test_clamp_above_range",
      "test_clamp_within_range",
      "test_clamp_in_place_modifies",
      "test_max_of_reads_without_mutating"
    ],
    hints: [
      "swap_ints needs a temporary so you do not overwrite one value before reading it.",
      "clamp_value takes plain ints and returns a result; it must not change the caller.",
      "max_of takes const int& — you may read the arguments but not assign to them."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "const-report-statistics",
    title: "Const-correctness: report statistics",
    skillIds: ["cpp.references.const_correctness", "cpp.references.parameter_passing", "dsa.arrays.traversal"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["report_statistics.hpp"],
    requiredTests: [
      "test_basic_mean",
      "test_single_value",
      "test_min_max_range",
      "test_handles_negatives",
      "test_empty_input"
    ],
    hints: [
      "Take the vector by const reference so you neither copy nor modify it.",
      "Seed min and max from values[0], then update both in a single pass.",
      "range is simply max - min; mean is total / values.size() as a double."
    ],
    projectLab: "number-guessing-stats"
  },
  {
    id: "pointers-safe-find",
    title: "Pointers: safe find into a vector",
    skillIds: ["cpp.references.pointers", "cpp.references.non_owning", "cpp.references.dangling"],
    difficulty: "beginner",
    estimatedMinutes: 25,
    editableFiles: ["safe_find.hpp"],
    requiredTests: [
      "test_finds_first_match",
      "test_returns_nullptr_when_missing",
      "test_empty_vector",
      "test_finds_first_of_duplicates",
      "test_mutable_pointer_edits_in_place",
      "test_contains"
    ],
    hints: [
      "Take the address of the loop variable with &v when it matches.",
      "Bind the loop variable by reference (const int& / int&) so &v points into the vector, not a copy.",
      "Return nullptr when the loop finishes without a match."
    ],
    projectLab: "note-manager"
  },
  {
    id: "structs-point-distance",
    title: "Structs: points and distance",
    skillIds: ["cpp.structs_classes.syntax", "cpp.structs_classes.const_methods_intro", "dsa.arrays.traversal"],
    difficulty: "beginner",
    estimatedMinutes: 25,
    editableFiles: ["point.hpp"],
    requiredTests: [
      "test_distance_horizontal",
      "test_distance_pythagorean",
      "test_distance_is_symmetric",
      "test_distance_to_self_is_zero",
      "test_perimeter_unit_square",
      "test_perimeter_degenerate"
    ],
    hints: [
      "distance_to reads only its members and other, so mark it const.",
      "Euclidean distance is std::sqrt(dx*dx + dy*dy).",
      "For the perimeter, connect vertex i to (i + 1) % n so the last edge wraps to the first."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "class-bank-account",
    title: "Classes: a bank account invariant",
    skillIds: ["cpp.structs_classes.public_private", "cpp.structs_classes.invariants_intro", "cpp.structs_classes.const_methods_intro"],
    difficulty: "beginner",
    estimatedMinutes: 30,
    editableFiles: ["bank_account.hpp"],
    requiredTests: [
      "test_starts_empty",
      "test_opening_balance",
      "test_negative_opening_clamps_to_zero",
      "test_deposit_increases_balance",
      "test_rejects_non_positive_deposit",
      "test_withdraw_succeeds_within_balance",
      "test_rejects_overdraft"
    ],
    hints: [
      "Keep the balance in a private member so only your methods can change it.",
      "Validate before mutating: a rejected deposit/withdraw must leave the balance untouched.",
      "balance() only reads state, so make it a const method."
    ],
    projectLab: "note-manager"
  },
  {
    id: "constructors-student-record",
    title: "Constructors: a student record",
    skillIds: ["cpp.constructors.parameterized_constructor", "cpp.constructors.member_initializer_list", "cpp.constructors.default_constructor"],
    difficulty: "beginner",
    estimatedMinutes: 25,
    editableFiles: ["student.hpp"],
    requiredTests: [
      "test_default_constructor",
      "test_parameterized_constructor",
      "test_negative_id_clamps",
      "test_gpa_clamps_high",
      "test_gpa_clamps_low",
      "test_honor_roll_threshold"
    ],
    hints: [
      "Initialize members in an initializer list (: name_(...), id_(...), gpa_(...)).",
      "Clamp inside the initializer list with a conditional or a small static helper.",
      "is_honor_roll only reads gpa_, so make it const and compare gpa_ >= 3.5."
    ],
    projectLab: "quiz-generator"
  },
  {
    id: "operators-fraction-normalize",
    title: "Operators: a normalized Fraction",
    skillIds: ["cpp.structs_classes.invariants_intro", "cpp.structs_classes.syntax", "cpp.functions.basics"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["fraction.hpp"],
    requiredTests: [
      "test_constructor_reduces",
      "test_sign_moves_to_numerator",
      "test_both_negative_is_positive",
      "test_zero_normalizes",
      "test_addition",
      "test_addition_reduces",
      "test_equality",
      "test_stream_insertion"
    ],
    hints: [
      "Normalize in the constructor: push the sign to the numerator (den > 0), then divide both by std::gcd(|num|, den).",
      "operator+ uses a common denominator (a.num*b.den + b.num*a.den) / (a.den*b.den); constructing the result normalizes it.",
      "Because every Fraction is already normalized, operator== can just compare num and den."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "unordered-map-log-counter",
    title: "STL: event log counter",
    skillIds: ["cpp.stl.map", "cpp.stl.algorithms", "dsa.strings.hashing"],
    difficulty: "beginner",
    estimatedMinutes: 25,
    editableFiles: ["log_counter.hpp"],
    requiredTests: [
      "test_records_and_counts",
      "test_count_absent_is_zero",
      "test_distinct",
      "test_most_frequent",
      "test_most_frequent_tie_breaks_by_name",
      "test_empty_most_frequent"
    ],
    hints: [
      "operator[] on a map default-constructs a 0 count, so ++counts_[event] just works.",
      "count() should use find() so a missing key does not insert a zero entry.",
      "For most_frequent, track the best as you scan and break ties with event < best."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "set-deduplicate-preserve-count",
    title: "STL: deduplicate and count",
    skillIds: ["cpp.stl.set", "cpp.stl.algorithms", "dsa.arrays.traversal"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["dedupe.hpp"],
    requiredTests: [
      "test_basic_dedupe",
      "test_already_unique",
      "test_empty",
      "test_all_same",
      "test_handles_negatives_sorted"
    ],
    hints: [
      "std::set<int>(values.begin(), values.end()) sorts and de-duplicates in one step.",
      "distinct is the set size; duplicates_removed is values.size() - distinct.",
      "Copy the set into sorted_unique with assign(set.begin(), set.end())."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "priority-queue-top-k",
    title: "STL: top-k with a heap",
    skillIds: ["cpp.stl.adapters", "cpp.stl.algorithms", "dsa.arrays.traversal"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["top_k.hpp"],
    requiredTests: [
      "test_top_three",
      "test_k_one",
      "test_k_ge_size_sorts_all",
      "test_k_zero_or_negative",
      "test_keeps_duplicates",
      "test_handles_negatives"
    ],
    hints: [
      "std::priority_queue<int> built from the range is a max-heap; top() is the largest.",
      "Pop min(k, size) times, pushing each top() onto the result.",
      "Handle k <= 0 up front by returning an empty vector."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "deque-browser-history",
    title: "STL: browser history",
    skillIds: ["cpp.structs_classes.public_private", "dsa.arrays.indexing", "cpp.structs_classes.invariants_intro"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["browser_history.hpp"],
    requiredTests: [
      "test_starts_on_homepage",
      "test_visit_updates_current",
      "test_back_and_forward",
      "test_back_clamps_at_start",
      "test_forward_clamps_at_end",
      "test_visit_clears_forward"
    ],
    hints: [
      "Keep a vector of visited pages and a cursor index into it.",
      "visit() should resize to cursor + 1 (dropping forward history) before push_back.",
      "Clamp the cursor to [0, size - 1] in back() and forward()."
    ],
    projectLab: "note-manager"
  },
  {
    id: "algorithm-clean-scores",
    title: "STL: clean a score list",
    skillIds: ["cpp.stl.algorithms", "cpp.stl.vector", "cpp.stl.lambdas"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["clean_scores.hpp"],
    requiredTests: [
      "test_sorts_and_dedupes",
      "test_drops_out_of_range",
      "test_inclusive_bounds",
      "test_all_invalid",
      "test_empty",
      "test_already_clean"
    ],
    hints: [
      "erase-remove idiom: scores.erase(std::remove_if(...), scores.end()).",
      "The range [lo, hi] is inclusive, so drop s < lo || s > hi.",
      "std::unique only removes ADJACENT duplicates, so sort before calling it."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "string-anagram-groups",
    title: "Strings: group anagrams",
    skillIds: ["dsa.strings.hashing", "dsa.strings.char_frequency", "cpp.stl.map"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["anagram_groups.hpp"],
    requiredTests: [
      "test_basic_grouping",
      "test_single_word",
      "test_all_distinct",
      "test_empty_input",
      "test_keeps_duplicates",
      "test_case_sensitive"
    ],
    hints: [
      "Use the sorted letters of a word as its anagram signature (map key).",
      "Bucket every word under its signature in a std::map<string, vector<string>>.",
      "Sort each bucket, then sort the buckets by their first word for determinism."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "csv-row-parser",
    title: "Parsing: CSV row with quotes",
    skillIds: ["dsa.strings.parsing", "dsa.strings.parsing_edge_cases", "cpp.utilities.stream_validation"],
    difficulty: "intermediate",
    estimatedMinutes: 35,
    editableFiles: ["csv_parser.hpp"],
    requiredTests: [
      "test_plain_fields",
      "test_quoted_comma",
      "test_escaped_quotes",
      "test_empty_fields",
      "test_trailing_empty_field",
      "test_quote_not_at_field_start_is_literal"
    ],
    hints: [
      "Track an in_quotes flag; a comma only splits when you are not inside quotes.",
      "Inside quotes, a doubled quote \"\" means one literal quote; a lone quote ends the field.",
      "Push the final field after the loop so a trailing comma yields an empty last field."
    ],
    projectLab: "csv-table-summarizer"
  },
  {
    id: "kmp-prefix-table",
    title: "Strings: KMP prefix table",
    skillIds: ["dsa.strings.prefix_function", "dsa.strings.searching", "dsa.strings.substring_subsequence"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["prefix_table.hpp"],
    requiredTests: [
      "test_empty",
      "test_single_char",
      "test_all_same",
      "test_no_repeats",
      "test_periodic",
      "test_overlapping",
      "test_fallback_case"
    ],
    hints: [
      "lps[0] is always 0; start the loop at i = 1.",
      "Keep k = lps[i-1]; while k > 0 and s[i] != s[k], set k = lps[k-1].",
      "If s[i] == s[k], increment k; then lps[i] = k."
    ],
    projectLab: "dictionary-autocomplete"
  },
  {
    id: "rolling-hash-substring-equality",
    title: "Strings: rolling-hash substring equality",
    skillIds: ["dsa.strings.hashing", "dsa.strings.searching", "dsa.strings.substring_subsequence"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["rolling_hash.hpp"],
    requiredTests: [
      "test_equal_substrings",
      "test_unequal_substrings",
      "test_zero_length_is_equal",
      "test_out_of_range_is_false",
      "test_full_string_self_equal",
      "test_repeated_blocks"
    ],
    hints: [
      "prefix[i+1] = prefix[i]*BASE + s[i] + 1; also precompute power[i] = BASE^i.",
      "The hash of s[start, start+len) is prefix[start+len] - prefix[start]*power[len].",
      "Handle len == 0 (equal) and ranges past the end (false) before hashing."
    ],
    projectLab: "dictionary-autocomplete"
  },
  {
    id: "array-remove-duplicates-sorted",
    title: "Arrays: remove duplicates in place",
    skillIds: ["dsa.arrays.two_pointers", "dsa.arrays.traversal", "dsa.complexity.big_o"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["remove_dups.hpp"],
    requiredTests: [
      "test_basic",
      "test_already_unique",
      "test_all_same",
      "test_empty",
      "test_single",
      "test_negatives_and_run"
    ],
    hints: [
      "Keep a write index starting at 1 (the first element is always kept).",
      "Advance a read index; copy nums[read] to nums[write] only when it differs from nums[write-1].",
      "Return the write index as the new length."
    ],
    projectLab: "csv-table-summarizer"
  },
  {
    id: "array-product-except-self",
    title: "Arrays: product except self",
    skillIds: ["dsa.techniques.prefix_sums", "dsa.arrays.traversal", "dsa.complexity.big_o"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["product_except_self.hpp"],
    requiredTests: [
      "test_basic",
      "test_pair",
      "test_single_zero",
      "test_two_zeros",
      "test_negatives",
      "test_single_element",
      "test_empty"
    ],
    hints: [
      "First pass: result[i] = product of all elements to the LEFT of i.",
      "Second pass (right to left): multiply result[i] by the product of everything to the RIGHT.",
      "This avoids division, so zeros are handled naturally."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "sliding-window-min-size-subarray",
    title: "Sliding window: minimum size subarray sum",
    skillIds: ["dsa.techniques.sliding_window", "dsa.arrays.two_pointers", "dsa.complexity.big_o"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["min_subarray.hpp"],
    requiredTests: [
      "test_basic",
      "test_whole_array",
      "test_no_solution",
      "test_single_element_suffices",
      "test_exact_sum",
      "test_empty"
    ],
    hints: [
      "Grow the window by adding nums[right] to a running sum.",
      "While the sum >= target, record the window length and subtract nums[left] as you advance left.",
      "Track the best length; 0 means no window ever reached the target."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "binary-search-first-last",
    title: "Binary search: first and last position",
    skillIds: ["dsa.searching.binary_search", "dsa.arrays.two_pointers", "dsa.complexity.big_o"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["first_last.hpp"],
    requiredTests: [
      "test_range_of_duplicates",
      "test_middle_pair",
      "test_not_found",
      "test_single_occurrence",
      "test_ends",
      "test_empty",
      "test_all_same"
    ],
    hints: [
      "Run two binary searches: one that keeps moving left on a match, one that keeps moving right.",
      "For the first index, when nums[mid] >= target move hi = mid - 1, remembering a match.",
      "For the last index, when nums[mid] <= target move lo = mid + 1, remembering a match."
    ],
    projectLab: "csv-table-summarizer"
  },
  {
    id: "interval-merge-meetings",
    title: "Intervals: merge meetings",
    skillIds: ["dsa.techniques.interval_scheduling", "dsa.sorting.comparator", "dsa.complexity.big_o"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["merge_intervals.hpp"],
    requiredTests: [
      "test_basic_merge",
      "test_touching_merge",
      "test_nested",
      "test_unsorted_input",
      "test_no_overlap",
      "test_single_and_empty"
    ],
    hints: [
      "Sort the intervals by their start value first.",
      "Sweep left to right; merge when the next start is <= the current end.",
      "When merging, extend the end to max(current end, next end) to handle nesting."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "linked-list-reverse",
    title: "Linked list: reverse in place",
    skillIds: ["dsa.trees.linked_list", "cpp.references.pointers", "dsa.trees.list_vs_vector"],
    difficulty: "beginner",
    estimatedMinutes: 25,
    editableFiles: ["reverse_list.hpp"],
    requiredTests: [
      "test_reverses_three",
      "test_reverses_two",
      "test_single",
      "test_empty",
      "test_longer_list"
    ],
    hints: [
      "Keep three pointers: prev (start nullptr), the current head, and the saved next.",
      "Each step: save next, point head->next at prev, advance prev and head.",
      "Return prev — it is the old tail, i.e. the new head."
    ],
    projectLab: "note-manager"
  },
  {
    id: "linked-list-detect-cycle",
    title: "Linked list: detect a cycle",
    skillIds: ["dsa.trees.linked_list", "cpp.references.pointers", "dsa.graphs.cycle_detection"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["detect_cycle.hpp"],
    requiredTests: [
      "test_no_cycle",
      "test_empty_has_no_cycle",
      "test_cycle_to_middle",
      "test_self_loop",
      "test_two_node_cycle",
      "test_single_no_cycle"
    ],
    hints: [
      "Move a slow pointer one step and a fast pointer two steps each iteration.",
      "Stop when fast or fast->next is null (no cycle) or slow == fast (cycle).",
      "Do not use an auxiliary visited set — the two-pointer method is O(1) space."
    ],
    projectLab: "note-manager"
  },
  {
    id: "stack-min-stack",
    title: "Stack: O(1) minimum",
    skillIds: ["dsa.stacks.basic_stack", "cpp.stl.adapters", "dsa.complexity.amortized"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["min_stack.hpp"],
    requiredTests: [
      "test_push_top_min",
      "test_min_tracks_smaller",
      "test_pop_restores_min",
      "test_duplicate_minimums",
      "test_empty_and_size",
      "test_negative_values"
    ],
    hints: [
      "Keep a second stack that stores the running minimum at each level.",
      "On push, the new min is min(x, previous min) (or x when empty).",
      "On pop, remove from both stacks so get_min() stays correct in O(1)."
    ],
    projectLab: "task-queue-lab"
  },
  {
    id: "tree-lowest-common-ancestor-bst",
    title: "Trees: lowest common ancestor in a BST",
    skillIds: ["dsa.trees.bst_search", "dsa.trees.traversal", "cpp.references.pointers"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["lca_bst.hpp"],
    requiredTests: [
      "test_split_at_root",
      "test_split_in_left_subtree",
      "test_ancestor_is_one_of_them",
      "test_deep_pair",
      "test_single_node"
    ],
    hints: [
      "Descend from the root using the BST ordering instead of searching both subtrees.",
      "If both p and q are less than the node, go left; if both greater, go right.",
      "Otherwise the values split here (or one equals the node) — this node is the LCA."
    ],
    projectLab: "dictionary-autocomplete"
  },
  {
    id: "dsu-number-of-islands",
    title: "Union-find: number of islands",
    skillIds: ["dsa.trees.disjoint_set", "dsa.graphs.connected_components", "dsa.trees.dsu_internals"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["num_islands.hpp"],
    requiredTests: [
      "test_empty_grid",
      "test_all_water",
      "test_single_land",
      "test_one_big_island",
      "test_three_islands",
      "test_diagonal_not_connected",
      "test_snake_island"
    ],
    hints: [
      "Give each land cell an id r*cols + c and union it with its right and down land neighbors.",
      "With union-find, the island count is the number of distinct roots among land cells.",
      "Only cells equal to '1' are land; connections are 4-directional, never diagonal."
    ],
    projectLab: "maze-route-planner"
  },
  {
    id: "graph-course-schedule",
    title: "Graphs: course schedule",
    skillIds: ["dsa.graphs.topological_sort", "dsa.graphs.cycle_detection", "dsa.graphs.representation"],
    difficulty: "intermediate",
    estimatedMinutes: 35,
    editableFiles: ["course_schedule.hpp"],
    requiredTests: [
      "test_simple_chain_ok",
      "test_two_course_cycle",
      "test_long_chain_ok",
      "test_three_course_cycle",
      "test_no_prereqs",
      "test_diamond_ok",
      "test_self_loop_is_cycle"
    ],
    hints: [
      "Build an adjacency list and an in-degree count from the prereq pairs {a,b} (b -> a).",
      "Kahn's algorithm: repeatedly take a course with in-degree 0 and decrement its dependents.",
      "If you can take all num_courses this way, there is no cycle; otherwise there is."
    ],
    projectLab: "maze-route-planner"
  },
  {
    id: "graph-clone-undirected",
    title: "Graphs: clone an undirected graph",
    skillIds: ["dsa.graphs.dfs", "dsa.graphs.representation", "cpp.references.pointers"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["clone_graph.hpp"],
    requiredTests: [
      "test_square",
      "test_triangle",
      "test_two_nodes",
      "test_single_node",
      "test_empty_graph"
    ],
    hints: [
      "Keep an original->copy map so each node is duplicated exactly once.",
      "Create a node's copy the first time you see it, then wire copied neighbor pointers.",
      "BFS or DFS both work; the map is what makes cycles and shared neighbors safe."
    ],
    projectLab: "maze-route-planner"
  },
  {
    id: "graph-dijkstra-network-delay",
    title: "Graphs: Dijkstra network delay",
    skillIds: ["dsa.graphs.shortest_path", "dsa.graphs.shortest_path_algorithms", "dsa.graphs.representation"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["network_delay.hpp"],
    requiredTests: [
      "test_reaches_all",
      "test_diamond_shortest",
      "test_unreachable_node",
      "test_single_node",
      "test_direct_edge",
      "test_direction_matters",
      "test_relaxation_picks_shorter"
    ],
    hints: [
      "Build a directed adjacency list of {neighbor, weight} and a dist array set to infinity.",
      "Use a min-heap keyed by distance; skip stale entries where d > dist[u].",
      "The answer is the maximum finite distance, or -1 if any node stays at infinity."
    ],
    projectLab: "maze-route-planner"
  },
  {
    id: "graph-bipartite-coloring",
    title: "Graphs: bipartite check",
    skillIds: ["dsa.graphs.bipartite_scc", "dsa.graphs.bfs", "dsa.graphs.representation"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["bipartite.hpp"],
    requiredTests: [
      "test_even_cycle_is_bipartite",
      "test_odd_cycle_not_bipartite",
      "test_tree_is_bipartite",
      "test_disconnected_mixed",
      "test_no_edges",
      "test_single_edge"
    ],
    hints: [
      "Build an undirected adjacency list and a color array initialized to -1.",
      "BFS from every uncolored vertex, giving each neighbor the opposite color.",
      "If a neighbor already has the same color as the current vertex, it is not bipartite."
    ],
    projectLab: "maze-route-planner"
  },
  {
    id: "graph-kruskal-mst",
    title: "Graphs: Kruskal minimum spanning tree",
    skillIds: ["dsa.graphs.mst", "dsa.trees.disjoint_set", "dsa.sorting.comparator"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["kruskal.hpp"],
    requiredTests: [
      "test_square_with_diagonals",
      "test_triangle_picks_two_smallest",
      "test_disconnected",
      "test_single_vertex",
      "test_two_vertices",
      "test_parallel_edges",
      "test_avoids_cycle_edge"
    ],
    hints: [
      "Sort the edges by ascending weight first.",
      "Use union-find: add an edge only when its endpoints are in different components.",
      "A spanning tree has exactly n-1 edges; if you add fewer, the graph is disconnected (-1)."
    ],
    projectLab: "maze-route-planner"
  },
  {
    id: "dp-climbing-stairs",
    title: "DP: climbing stairs",
    skillIds: ["dsa.techniques.dynamic_programming", "dsa.recursion.base_case", "dsa.techniques.dp_forms"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["climb_stairs.hpp"],
    requiredTests: ["test_base_cases", "test_small", "test_ten", "test_larger_uses_long_long"],
    hints: [
      "The recurrence is ways(n) = ways(n-1) + ways(n-2) — the same shape as Fibonacci.",
      "Base cases: ways(0) = ways(1) = 1.",
      "Roll two variables forward instead of recursing, for O(n) time and O(1) space."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "dp-house-robber",
    title: "DP: house robber",
    skillIds: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_design", "dsa.arrays.traversal"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["house_robber.hpp"],
    requiredTests: ["test_basic", "test_larger", "test_empty", "test_single", "test_two", "test_alternating_choice", "test_all_zero"],
    hints: [
      "Track two running values: the best total that ends by taking house i, and the best that skips it.",
      "new_take = previous_skip + value; new_skip = max(previous_take, previous_skip).",
      "The answer is the max of the two after the last house."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "dp-coin-change-min",
    title: "DP: minimum coin change",
    skillIds: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_design", "dsa.complexity.time_space_tradeoffs"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["coin_change.hpp"],
    requiredTests: ["test_basic", "test_small_amount", "test_zero_amount", "test_impossible", "test_single_coin_repeated", "test_prefers_larger_coins", "test_no_coins"],
    hints: [
      "best[0] = 0; initialize the rest to a sentinel larger than any real answer.",
      "For each amount a, try every coin <= a: best[a] = min(best[a], best[a-coin] + 1).",
      "Greedy (always biggest coin) can be wrong — the DP is needed (e.g. coins 1,3,4 for 6)."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "dp-longest-common-subsequence",
    title: "DP: longest common subsequence",
    skillIds: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_forms", "dsa.strings.substring_subsequence"],
    difficulty: "intermediate",
    estimatedMinutes: 35,
    editableFiles: ["lcs.hpp"],
    requiredTests: ["test_classic", "test_identical", "test_disjoint", "test_empty", "test_interleaved", "test_repeated_chars"],
    hints: [
      "dp[i][j] is the LCS length of the first i chars of a and first j chars of b.",
      "If the current chars match, extend the diagonal: dp[i-1][j-1] + 1.",
      "Otherwise take max(dp[i-1][j], dp[i][j-1]); two rolling rows keep it O(min(n,m)) space."
    ],
    projectLab: "dictionary-autocomplete"
  },
  {
    id: "greedy-jump-game",
    title: "Greedy: jump game",
    skillIds: ["dsa.techniques.greedy", "dsa.techniques.greedy_proof", "dsa.arrays.traversal"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["jump_game.hpp"],
    requiredTests: ["test_reachable", "test_stuck_at_zero", "test_single", "test_empty", "test_zero_then_more", "test_blocked", "test_exact_reach"],
    hints: [
      "Track the farthest index you can reach as you scan from the left.",
      "If the current index is beyond that farthest reach, you are stuck — return false.",
      "Update reach = max(reach, i + nums[i]); success once reach covers the last index."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "greedy-activity-selection",
    title: "Greedy: activity selection",
    skillIds: ["dsa.techniques.greedy", "dsa.techniques.interval_scheduling", "dsa.techniques.greedy_proof"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["activity_selection.hpp"],
    requiredTests: ["test_classic", "test_empty", "test_single", "test_all_overlap", "test_all_disjoint", "test_touching_is_compatible"],
    hints: [
      "Sort activities by their end time.",
      "Greedily take an activity whenever its start is >= the last taken end.",
      "Touching intervals (end == next start) are compatible."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "backtracking-subsets",
    title: "Backtracking: subsets",
    skillIds: ["dsa.recursion.base_case", "dsa.complexity.recursion_choice", "dsa.math.combinatorics"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["subsets.hpp"],
    requiredTests: ["test_empty_input", "test_single", "test_three", "test_unsorted_input_normalizes", "test_count_is_power_of_two"],
    hints: [
      "Sort the input so each subset comes out in ascending order.",
      "Recurse on index i with two branches: skip nums[i], or include it (push/pop around the recursion).",
      "Record the current subset at the base case (i == size), then sort the result list."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "backtracking-combination-sum",
    title: "Backtracking: combination sum",
    skillIds: ["dsa.recursion.base_case", "dsa.complexity.recursion_choice", "dsa.math.generate_combinations"],
    difficulty: "advanced",
    estimatedMinutes: 35,
    editableFiles: ["combination_sum.hpp"],
    requiredTests: ["test_basic", "test_multiple", "test_unreachable", "test_single_candidate_repeated", "test_unsorted_input", "test_target_zero"],
    hints: [
      "Sort candidates so combinations come out ascending and you can prune early.",
      "Recurse from a start index and pass the SAME index down so a candidate can repeat.",
      "Record the current combination when the remainder hits 0; sort the result list."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "math-fast-power-mod",
    title: "Math: fast modular exponentiation",
    skillIds: ["dsa.math.modular_arithmetic", "dsa.math.number_theory", "dsa.math.bit_manipulation"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["fast_power.hpp"],
    requiredTests: ["test_basic", "test_exponent_zero", "test_mod_one", "test_base_zero", "test_small_wraps", "test_large_no_overflow"],
    hints: [
      "Square the base and halve the exponent each step; multiply into the result when the low bit is set.",
      "Reduce base % m up front and after each multiply to keep numbers small.",
      "Cast to __int128 before taking % m so the product cannot overflow 64 bits."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "geometry-segment-intersection",
    title: "Geometry: segment intersection",
    skillIds: ["dsa.math.segment_intersection", "dsa.math.geometry", "dsa.math.vectors_dot_cross"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["segment_intersection.hpp"],
    requiredTests: ["test_proper_cross", "test_parallel_apart", "test_touch_at_endpoint", "test_t_junction", "test_collinear_overlap", "test_collinear_disjoint", "test_disjoint_general"],
    hints: [
      "Use the cross product to get the orientation of each endpoint against the other segment.",
      "A proper crossing happens when the two endpoints of each segment straddle the other (opposite signs).",
      "When an orientation is 0 the points are collinear — then check the bounding box (on-segment)."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "template-generic-clamp",
    title: "Templates: generic clamp",
    skillIds: ["cpp.templates.function_templates", "cpp.templates.deduction", "cpp.templates.multiple_params"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["generic_clamp.hpp"],
    requiredTests: ["test_int", "test_double", "test_char", "test_string", "test_boundaries"],
    hints: [
      "Take value, lo, hi as const T& so the same code works for every type.",
      "Compare with operator< only: value < lo, and hi < value for the upper bound.",
      "Return lo, hi, or value — no copies of anything else are needed."
    ],
    projectLab: "unit-converter"
  },
  {
    id: "template-fixed-array",
    title: "Templates: fixed-size array",
    skillIds: ["cpp.templates.class_templates", "cpp.templates.multiple_params", "cpp.templates.constexpr"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["fixed_array.hpp"],
    requiredTests: ["test_size_and_default", "test_index_assignment", "test_fill", "test_double_type", "test_const_access"],
    hints: [
      "The class is parameterized on both a type T and a std::size_t N.",
      "fill(value) writes value into every one of the N slots.",
      "sum() starts from T{} (a natural zero) and adds each element with operator+."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "optional-parse-int",
    title: "Utilities: optional parse int",
    skillIds: ["cpp.utilities.stream_validation", "dsa.strings.parsing_edge_cases", "cpp.functions.basics"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["parse_int.hpp"],
    requiredTests: ["test_positive", "test_negative", "test_leading_plus", "test_empty_is_nullopt", "test_trailing_garbage", "test_surrounding_space", "test_non_numeric", "test_overflow"],
    hints: [
      "std::from_chars(begin, end, value) returns {ptr, ec}; require ec == std::errc{} AND ptr == end.",
      "Handle empty input up front, and strip a single leading '+' before calling from_chars.",
      "Overflow shows up as ec == std::errc::result_out_of_range — return nullopt."
    ],
    projectLab: "csv-table-summarizer"
  },
  {
    id: "variant-json-token",
    title: "Utilities: variant JSON token",
    skillIds: ["cpp.utilities.variant", "cpp.utilities.variant_visit", "cpp.templates.if_constexpr"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["json_token.hpp"],
    requiredTests: ["test_kind", "test_truthy_null_and_bool", "test_truthy_number", "test_truthy_string"],
    hints: [
      "std::visit calls your lambda with the currently-held alternative.",
      "Inside a generic lambda, use `using T = std::decay_t<decltype(value)>;` then branch with `if constexpr`.",
      "std::is_same_v<T, std::nullptr_t/bool/double> distinguishes the cases; the else is the string."
    ],
    projectLab: "csv-table-summarizer"
  },
  {
    id: "ranges-filter-transform",
    title: "Ranges: filter then transform",
    skillIds: ["cpp.templates.ranges", "cpp.templates.ranges_depth", "cpp.stl.lambdas"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["ranges_pipeline.hpp"],
    requiredTests: ["test_mixed", "test_all_even", "test_no_evens", "test_empty", "test_negatives_and_zero", "test_preserves_order"],
    hints: [
      "Pipe the vector through std::views::filter(is_even) then std::views::transform(square).",
      "The pipeline is lazy — iterate it to materialize results into a vector.",
      "0 is even, so it stays (and squares to 0); order follows the input."
    ],
    projectLab: "text-statistics-analyzer"
  },
  {
    id: "geometry-convex-hull",
    title: "Geometry: convex hull",
    skillIds: ["dsa.math.convex_hull", "dsa.math.geometry", "dsa.math.vectors_dot_cross"],
    difficulty: "advanced",
    estimatedMinutes: 45,
    editableFiles: ["convex_hull.hpp"],
    requiredTests: ["test_square_drops_interior", "test_drops_collinear_edge_point", "test_triangle", "test_two_points", "test_duplicates_collapse", "test_pentagon_with_inner_cloud"],
    hints: [
      "Sort points by (x, y) and remove exact duplicates first.",
      "Build a lower chain left-to-right and an upper chain right-to-left, popping while the last turn is not a strict left turn (cross <= 0).",
      "Concatenate the two chains, dropping the repeated endpoints."
    ],
    projectLab: "math-technique-playground"
  },
  {
    id: "debug-fix-off-by-one",
    title: "Debugging: fix the off-by-one",
    skillIds: ["cpp.tooling.debugging_method", "cpp.control_flow.loop_invariants", "cpp.control_flow.loops"],
    difficulty: "beginner",
    estimatedMinutes: 15,
    editableFiles: ["range_sum.hpp"],
    requiredTests: ["test_one_to_five", "test_single_value", "test_zero_to_ten", "test_symmetric_negatives", "test_hundred"],
    hints: [
      "The intended range is inclusive of hi, but the loop condition stops before it.",
      "Change the comparison so i reaches hi (i <= hi).",
      "Check the single-value case (lo == hi): it must still add exactly one term."
    ],
    projectLab: "debugging-toolchain-lab"
  },
  {
    id: "input-validation-menu-loop",
    title: "Utilities: validate menu input",
    skillIds: ["cpp.utilities.stream_validation", "cpp.control_flow.loops", "dsa.strings.parsing_edge_cases"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["menu.hpp"],
    requiredTests: ["test_skips_invalid_then_takes_valid", "test_none_valid", "test_single_valid", "test_empty_list", "test_rejects_trailing_and_spaces", "test_boundaries"],
    hints: [
      "Loop over the tokens; validate each with std::from_chars requiring the whole token to parse.",
      "Only accept when the parsed value is in [1, 4]; skip everything else.",
      "Return the first accepted value, or -1 after the loop finds nothing."
    ],
    projectLab: "quiz-generator"
  },
  {
    id: "chrono-rate-limiter-sim",
    title: "Utilities: rate limiter simulation",
    skillIds: ["cpp.utilities.chrono", "dsa.techniques.sliding_window", "dsa.arrays.traversal"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["rate_limiter.hpp"],
    requiredTests: ["test_basic_window", "test_limit_one", "test_all_allowed_when_spaced", "test_burst_throttled", "test_empty", "test_window_boundary_evicts"],
    hints: [
      "Keep a deque of the timestamps you have ALLOWED so far.",
      "Before each request, pop the front while allowed.front() <= t - window (out of window).",
      "Allow (and record) the request only when the deque holds fewer than max_requests."
    ],
    projectLab: "task-queue-lab"
  },
  {
    id: "random-dice-histogram",
    title: "Utilities: seeded dice histogram",
    skillIds: ["cpp.utilities.random", "cpp.utilities.random_quality", "dsa.arrays.traversal"],
    difficulty: "beginner",
    estimatedMinutes: 20,
    editableFiles: ["dice_histogram.hpp"],
    requiredTests: ["test_seed42_six_rolls", "test_seed1_twelve_rolls", "test_zero_rolls", "test_counts_sum_to_rolls", "test_large_distribution_exact"],
    hints: [
      "Construct std::mt19937 rng(seed) once, then roll in a loop.",
      "Map each output to a face with rng() % 6 (0..5) and increment counts[that].",
      "Because mt19937 is standardized, the same seed reproduces the same tally exactly."
    ],
    projectLab: "number-guessing-stats"
  },
  {
    id: "filesystem-extension-summary",
    title: "Utilities: file extension summary",
    skillIds: ["cpp.utilities.filesystem", "dsa.strings.parsing", "cpp.stl.map"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["extension_summary.hpp"],
    requiredTests: ["test_basic_counts", "test_no_extension_and_dotfiles", "test_multi_dot_takes_last", "test_case_preserved", "test_paths_with_directories", "test_empty"],
    hints: [
      "std::filesystem::path(name).extension() gives the last extension including the dot (\".txt\").",
      "It parses the string only — no disk access is needed.",
      "An empty extension (plain names and dotfiles like .gitignore) should tally under \"(none)\"."
    ],
    projectLab: "directory-inventory-reporter"
  },
  {
    id: "concurrency-atomic-counter",
    title: "Concurrency: atomic counter",
    skillIds: ["cpp.concurrency.atomics", "cpp.concurrency.threads", "cpp.concurrency.data_races"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["atomic_counter.hpp"],
    requiredTests: ["test_four_threads", "test_single_thread", "test_many_threads", "test_zero_threads", "test_zero_work", "test_repeatable_under_contention"],
    hints: [
      "Store the count in a std::atomic<long long> shared by reference with each thread.",
      "Each thread does per_thread increments with fetch_add (memory_order_relaxed is enough here).",
      "Collect the threads in a vector and join them all before reading the counter."
    ],
    projectLab: "task-queue-lab"
  },
  {
    id: "concurrency-producer-consumer",
    title: "Concurrency: producer/consumer",
    skillIds: ["cpp.concurrency.condition_variables", "cpp.concurrency.mutexes", "cpp.concurrency.shared_state_design"],
    difficulty: "advanced",
    estimatedMinutes: 45,
    editableFiles: ["producer_consumer.hpp"],
    requiredTests: ["test_basic", "test_single_pair", "test_many", "test_one_item_each", "test_no_producers", "test_repeatable_under_contention"],
    hints: [
      "Protect the queue with a mutex; consumers cv.wait on a predicate (!queue.empty() || done).",
      "Track how many producers are still active; when the last finishes, set done and notify_all.",
      "After wait, if the queue is empty you must be done — return; otherwise pop under the lock, then add to an atomic total."
    ],
    projectLab: "task-queue-lab"
  },
  {
    id: "raii-file-handle-simulator",
    title: "RAII: file handle simulator",
    skillIds: ["cpp.raii.resource_lifetime", "cpp.raii.destructor_cleanup", "cpp.raii.ownership_boundary"],
    difficulty: "intermediate",
    estimatedMinutes: 25,
    editableFiles: ["file_handle.hpp"],
    requiredTests: ["test_open_on_construct", "test_scope_cleanup", "test_explicit_close", "test_close_is_idempotent"],
    hints: [
      "Increment the shared counter in the constructor (the resource is now open).",
      "Guard close() with the open_ flag so it decrements exactly once.",
      "The destructor should just call close() — that gives you automatic cleanup at scope exit."
    ],
    projectLab: "note-manager"
  },
  {
    id: "value-semantics-deep-copy-buffer",
    title: "Value semantics: deep-copy buffer",
    skillIds: ["cpp.value_semantics.deep_copy", "cpp.value_semantics.rule_of_zero_five", "cpp.value_semantics.move"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["buffer.hpp"],
    requiredTests: ["test_construct_zeroed", "test_deep_copy_is_independent", "test_copy_assignment_independent", "test_self_assignment_safe", "test_move_transfers", "test_move_assignment_transfers"],
    hints: [
      "Copy must allocate its own array and std::copy the elements (deep, not shared).",
      "Copy assignment: allocate the new buffer first, then delete the old one — and guard against self-assignment.",
      "Move steals the pointer and sets the source's pointer to nullptr and size to 0."
    ],
    projectLab: "note-manager"
  },
  {
    id: "unique-ptr-task-list",
    title: "Smart pointers: unique_ptr task list",
    skillIds: ["cpp.smart_pointers.unique_ptr", "cpp.smart_pointers.ownership_transfer", "cpp.smart_pointers.ownership_choice"],
    difficulty: "intermediate",
    estimatedMinutes: 30,
    editableFiles: ["task_list.hpp"],
    requiredTests: ["test_add_and_size", "test_find", "test_remove", "test_take_transfers_ownership", "test_take_missing"],
    hints: [
      "Use std::make_unique<Task>(...) in add and store the pointers in a vector.",
      "find() returns task.get() — a non-owning view; the vector keeps ownership.",
      "take() must std::move the unique_ptr out of the vector before erasing the slot."
    ],
    projectLab: "todo-planner"
  },
  {
    id: "shared-weak-observer-graph",
    title: "Smart pointers: shared/weak observer graph",
    skillIds: ["cpp.smart_pointers.shared_ptr", "cpp.smart_pointers.weak_ptr", "cpp.smart_pointers.cyclic_reference"],
    difficulty: "advanced",
    estimatedMinutes: 35,
    editableFiles: ["observer_graph.hpp"],
    requiredTests: ["test_parent_value", "test_weak_does_not_raise_use_count", "test_expired_parent_returns_minus_one", "test_root_has_no_parent", "test_multiple_children"],
    hints: [
      "Children are owned with shared_ptr; the parent back-link is a weak_ptr.",
      "Assigning child->parent = parent stores a weak reference — it does not bump the parent's use_count.",
      "parent_value locks the weak_ptr; an empty lock() means the parent is gone, so return -1."
    ],
    projectLab: "note-manager"
  },
  {
    id: "vector-running-median-simple",
    title: "Heaps: running median",
    skillIds: ["dsa.trees.heap", "dsa.trees.heap_applications", "cpp.stl.adapters"],
    difficulty: "advanced",
    estimatedMinutes: 40,
    editableFiles: ["running_median.hpp"],
    requiredTests: ["test_increasing", "test_unsorted", "test_single", "test_empty", "test_duplicates", "test_mixed_stream"],
    hints: [
      "Keep a max-heap for the smaller half and a min-heap for the larger half.",
      "After each push, rebalance so the heaps differ in size by at most one.",
      "Equal sizes -> median is the average of the two tops; otherwise it is the larger heap's top."
    ],
    projectLab: "math-technique-playground"
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
