-- Roadmap #71 / #113 (error-strategy follow-up): learning items for
-- preconditions/validation, optional/expected, and error-strategy selection.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.tooling.preconditions.lesson',
    'lesson',
    'Preconditions and input validation',
    'Distinguish two kinds of checks. Input validation handles untrusted data crossing a real boundary — user input, files, network, parsing — where bad data is expected; validate it and return/report a recoverable error (or throw). Preconditions are the contract a function requires of its caller — e.g. "index must be in range," "pointer must be non-null." Those describe a programming bug if violated, so the right tool is an assert (active in debug builds, compiled out in release) rather than runtime validation in every call, which would be slow and would mask the bug. Rule of thumb: validate at the edges of your program; assert internal invariants you control. Do not trust external input, but do not defensively re-check things your own code already guarantees — that is the "only validate at real boundaries" principle.',
    'Validate untrusted input at real boundaries (user/file/network) and report recoverable errors; use assert for caller-contract preconditions (a bug if violated), not runtime checks on every call.',
    'intermediate',
    5,
    3630,
    true
  ),
  (
    'cpp.tooling.preconditions.mc_assert',
    'multiple_choice',
    'Validate or assert?',
    'A private helper requires its caller to pass a non-null pointer (a contract your own code guarantees). How should it enforce that?',
    'Use an assert: a violated internal precondition is a programming bug, caught in debug builds and compiled out of release. Full runtime validation is for untrusted input crossing a boundary, not contracts your own code already guarantees.',
    'intermediate',
    2,
    3640,
    true
  ),
  (
    'cpp.tooling.optional_expected.lesson',
    'lesson',
    'Signaling failure with optional and expected',
    'Two return-based ways to report failure without exceptions. std::optional<T> says "a T or nothing" — perfect when absence is normal and the reason does not matter (a lookup miss, a parse that found no value). std::expected<T, E> (C++23) says "a T or an error of type E" — use it when the caller needs to know why it failed (an error code, message, or enum). Both make failure part of the type, so the caller must handle it (check has_value() / if (opt) before using *), unlike a bare sentinel that is easy to ignore. They cost nothing when there is no exception machinery and read linearly. Reach for optional when "missing" is enough information, and expected when you must carry an error value back.',
    'std::optional<T> = value or nothing (absence, reason irrelevant). std::expected<T,E> = value or an error E (caller needs the reason). Both put failure in the type so it cannot be silently ignored.',
    'advanced',
    5,
    3650,
    true
  ),
  (
    'cpp.tooling.optional_expected.mc_choose',
    'multiple_choice',
    'optional or expected?',
    'A function can fail and the caller needs to know the specific reason it failed. Which return type fits best?',
    'std::expected<T, E> carries either the value or an error E describing why it failed. std::optional<T> only signals presence/absence with no reason.',
    'advanced',
    2,
    3660,
    true
  ),
  (
    'cpp.tooling.error_strategy.lesson',
    'lesson',
    'Choosing an error-handling strategy',
    'Match the mechanism to the failure. Use exceptions for genuinely exceptional, hard-to-handle-locally failures (constructor failure, out-of-memory, deep call stacks) — they unwind cleanly with RAII and keep the happy path uncluttered, but should not drive ordinary control flow because throwing is costly and hides flow. Use std::optional/std::expected for expected, recoverable outcomes a caller will handle right away (lookup miss, parse failure) — failure is in the return type and there is no unwinding cost. Use error codes (or std::error_code) at C-style or performance-critical boundaries and when interoperating with C. The deciding questions: is the failure expected or truly exceptional? Must every caller handle it now, or can it propagate far up? Is throwing on the hot path? Avoid using exceptions for normal branching like "not found," which is better expressed as optional.',
    'Exceptions for truly exceptional failures that unwind far (with RAII); optional/expected for expected, locally-handled outcomes; error codes at C/perf boundaries. Do not use exceptions for ordinary control flow.',
    'advanced',
    6,
    3670,
    true
  ),
  (
    'cpp.tooling.error_strategy.mc_controlflow',
    'multiple_choice',
    'Not-found is not exceptional',
    'A lookup that frequently finds nothing should report "not found" how?',
    'Return a std::optional (or expected) — "not found" is an expected, recoverable outcome the caller handles immediately. Throwing an exception for ordinary, frequent control flow is costly and obscures the logic.',
    'advanced',
    2,
    3680,
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
  ('cpp.tooling.preconditions.lesson', 'cpp.tooling.preconditions', true),
  ('cpp.tooling.preconditions.mc_assert', 'cpp.tooling.preconditions', true),
  ('cpp.tooling.optional_expected.lesson', 'cpp.tooling.optional_expected', true),
  ('cpp.tooling.optional_expected.mc_choose', 'cpp.tooling.optional_expected', true),
  ('cpp.tooling.error_strategy.lesson', 'cpp.tooling.error_strategy', true),
  ('cpp.tooling.error_strategy.mc_controlflow', 'cpp.tooling.error_strategy', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.tooling.preconditions.mc_assert.a', 'cpp.tooling.preconditions.mc_assert', 'assert the pointer is non-null (a violated contract is a bug)', true, 10),
  ('cpp.tooling.preconditions.mc_assert.b', 'cpp.tooling.preconditions.mc_assert', 'Throw an exception on every call', false, 20),
  ('cpp.tooling.preconditions.mc_assert.c', 'cpp.tooling.preconditions.mc_assert', 'Return an error code from the helper', false, 30),
  ('cpp.tooling.preconditions.mc_assert.d', 'cpp.tooling.preconditions.mc_assert', 'Ignore it; the caller is responsible', false, 40),
  ('cpp.tooling.optional_expected.mc_choose.a', 'cpp.tooling.optional_expected.mc_choose', 'std::expected<T, E> (carries the value or an error reason)', true, 10),
  ('cpp.tooling.optional_expected.mc_choose.b', 'cpp.tooling.optional_expected.mc_choose', 'std::optional<T> (presence only, no reason)', false, 20),
  ('cpp.tooling.optional_expected.mc_choose.c', 'cpp.tooling.optional_expected.mc_choose', 'A bare bool return', false, 30),
  ('cpp.tooling.optional_expected.mc_choose.d', 'cpp.tooling.optional_expected.mc_choose', 'A magic sentinel value like -1', false, 40),
  ('cpp.tooling.error_strategy.mc_controlflow.a', 'cpp.tooling.error_strategy.mc_controlflow', 'Return std::optional (not found is an expected, recoverable outcome)', true, 10),
  ('cpp.tooling.error_strategy.mc_controlflow.b', 'cpp.tooling.error_strategy.mc_controlflow', 'Throw an exception each time nothing is found', false, 20),
  ('cpp.tooling.error_strategy.mc_controlflow.c', 'cpp.tooling.error_strategy.mc_controlflow', 'Call std::abort', false, 30),
  ('cpp.tooling.error_strategy.mc_controlflow.d', 'cpp.tooling.error_strategy.mc_controlflow', 'Set a global errno-style flag', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
