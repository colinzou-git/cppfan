-- Roadmap #71 / #113 final coverage: diagnostic/test/sanitizer output
-- interpretation and formatting/static-analysis items.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.tooling.debugging_method.code_first_diagnostic',
    'code_reading',
    'Read the first actionable diagnostic',
    $prompt$A build prints: `parser.cpp:17:12: error: expected ';' after return statement`, then twenty more errors in STL headers. Which line should you investigate first, and why?$prompt$,
    $explanation$Start at the first actionable diagnostic in your code: `parser.cpp:17`. Later messages are often cascade errors caused by the first syntax problem. Fix the missing semicolon there, rebuild, and only then read any remaining diagnostics.$explanation$,
    'intermediate',
    3,
    4950,
    true
  ),
  (
    'cpp.tooling.debugging_method.mc_failure_kind',
    'multiple_choice',
    'Classify the failure',
    $prompt$The program builds successfully, but prints `17` when the expected answer is `16`. What kind of failure is this?$prompt$,
    $explanation$That is a logic failure: the program runs, but the result is wrong. Syntax/compile errors stop the build, link errors happen before an executable is produced, and run-time failures crash or abort while running.$explanation$,
    'intermediate',
    2,
    4960,
    true
  ),
  (
    'cpp.tooling.unit_testing.code_failure_output',
    'code_reading',
    'Interpret a test failure',
    $prompt$A test named `test_empty_input_returns_zero` fails with `CHECK(count_words("") == 0)` and reports `actual: 1`. What behavior should you inspect first?$prompt$,
    $explanation$The test name and assertion say the empty-input boundary case is wrong. Inspect the path that handles an empty string before looking at unrelated normal cases; good failure output points to the behavior, input, and expected value.$explanation$,
    'intermediate',
    3,
    4970,
    true
  ),
  (
    'cpp.tooling.unit_testing.mc_boundaries',
    'multiple_choice',
    'Choose boundary and adversarial cases',
    $prompt$Which test set best checks a function that returns the maximum element of a vector?$prompt$,
    $explanation$A strong test set includes a normal case, a single-element boundary, duplicates, negative values, and the empty/error case. Only happy-path tests miss boundary and adversarial defects.$explanation$,
    'intermediate',
    2,
    4980,
    true
  ),
  (
    'cpp.tooling.sanitizers.code_asan_report',
    'code_reading',
    'Read an AddressSanitizer report',
    $prompt$A sanitizer run reports `ERROR: AddressSanitizer: heap-buffer-overflow` and the top frame points to `scores.cpp:42` inside `scores[i]`. What should you inspect first?$prompt$,
    $explanation$Inspect the index and bounds around `scores.cpp:42`. ASan reports the memory bug class and the stack frame for the invalid access; a heap-buffer-overflow usually means an index went before the beginning or past the end of the allocation.$explanation$,
    'advanced',
    3,
    4990,
    true
  ),
  (
    'cpp.tooling.format_static_analysis.lesson',
    'lesson',
    'Formatting and static analysis',
    $prompt$Formatting and static analysis are fast feedback tools before review. A formatter such as clang-format makes layout mechanical, so reviews focus on behavior instead of brace placement. Static analysis tools such as clang-tidy inspect code without running it and catch patterns compilers may not warn about: suspicious copies, ignored return values, dangling references, missing virtual destructors, or expensive pass-by-value. They complement warnings and tests; they do not replace either. Run them locally or in CI, keep the configuration small enough that the team trusts it, and fix or document each warning rather than letting a backlog grow.$prompt$,
    $explanation$Use a formatter for consistent style and static analysis for likely defects beyond compiler warnings. They are fast pre-review feedback, complementary to tests and sanitizers, and only useful if warnings are kept actionable.$explanation$,
    'intermediate',
    4,
    5000,
    true
  ),
  (
    'cpp.tooling.format_static_analysis.mc_role',
    'multiple_choice',
    'What static analysis is for',
    $prompt$What is the best role for a tool like clang-tidy in a C++ workflow?$prompt$,
    $explanation$Static analysis scans source for likely defects and maintainability issues before the program runs. It complements compiler warnings, tests, and sanitizers; it is not a formatter and cannot prove the whole program correct.$explanation$,
    'intermediate',
    2,
    5010,
    true
  )
on conflict (id) do update
set
  type = excluded.type,
  title = excluded.title,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
values
  ('cpp.tooling.debugging_method.code_first_diagnostic', 'cpp.tooling.debugging_method', true),
  ('cpp.tooling.debugging_method.mc_failure_kind', 'cpp.tooling.debugging_method', true),
  ('cpp.tooling.unit_testing.code_failure_output', 'cpp.tooling.unit_testing', true),
  ('cpp.tooling.unit_testing.mc_boundaries', 'cpp.tooling.unit_testing', true),
  ('cpp.tooling.sanitizers.code_asan_report', 'cpp.tooling.sanitizers', true),
  ('cpp.tooling.format_static_analysis.lesson', 'cpp.tooling.format_static_analysis', true),
  ('cpp.tooling.format_static_analysis.mc_role', 'cpp.tooling.format_static_analysis', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.tooling.debugging_method.mc_failure_kind.a', 'cpp.tooling.debugging_method.mc_failure_kind', 'Logic failure', true, 10),
  ('cpp.tooling.debugging_method.mc_failure_kind.b', 'cpp.tooling.debugging_method.mc_failure_kind', 'Syntax/compile failure', false, 20),
  ('cpp.tooling.debugging_method.mc_failure_kind.c', 'cpp.tooling.debugging_method.mc_failure_kind', 'Link failure', false, 30),
  ('cpp.tooling.debugging_method.mc_failure_kind.d', 'cpp.tooling.debugging_method.mc_failure_kind', 'Run-time crash', false, 40),
  ('cpp.tooling.unit_testing.mc_boundaries.a', 'cpp.tooling.unit_testing.mc_boundaries', 'Normal input, one element, duplicates, negative values, and empty/error input', true, 10),
  ('cpp.tooling.unit_testing.mc_boundaries.b', 'cpp.tooling.unit_testing.mc_boundaries', 'Only a large random vector with positive values', false, 20),
  ('cpp.tooling.unit_testing.mc_boundaries.c', 'cpp.tooling.unit_testing.mc_boundaries', 'Only the example from the README', false, 30),
  ('cpp.tooling.unit_testing.mc_boundaries.d', 'cpp.tooling.unit_testing.mc_boundaries', 'No tests; rely on the compiler to catch it', false, 40),
  ('cpp.tooling.format_static_analysis.mc_role.a', 'cpp.tooling.format_static_analysis.mc_role', 'Scan source for likely defects and maintainability issues before running it', true, 10),
  ('cpp.tooling.format_static_analysis.mc_role.b', 'cpp.tooling.format_static_analysis.mc_role', 'Automatically prove every execution path correct', false, 20),
  ('cpp.tooling.format_static_analysis.mc_role.c', 'cpp.tooling.format_static_analysis.mc_role', 'Replace unit tests and sanitizer runs', false, 30),
  ('cpp.tooling.format_static_analysis.mc_role.d', 'cpp.tooling.format_static_analysis.mc_role', 'Only reformat whitespace and braces', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
