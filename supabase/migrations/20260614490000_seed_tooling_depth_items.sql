-- Roadmap #71 / #113 (tooling depth): learning items for a systematic debugging
-- method, writing good unit tests, and regression tests + determinism.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.tooling.debugging_method.lesson',
    'lesson',
    'A systematic debugging method',
    'Debugging is a search, not a guess. Start by CLASSIFYING the failure: does it fail to compile, crash (segfault/abort), produce wrong output, or hang? Each points somewhere different — a crash suggests bad memory or a null/dangling access (run under a sanitizer or debugger to get the faulting line); wrong output suggests a logic or boundary error; a hang suggests an infinite loop or deadlock. Next, build a MINIMAL REPRODUCIBLE example: shrink the input and remove unrelated code until you have the smallest case that still fails. Minimizing often reveals the cause by itself, and it makes every later step faster. Then narrow the location: form a hypothesis about where the bug is, set a BREAKPOINT and STEP through, WATCH the key variables, and compare actual vs expected state at each point — or binary-search by checking the value at the midpoint of the suspect range to halve the search each time. A debugger gives live state and a call stack; targeted logging is fine when a debugger is awkward (concurrency, release-only). Change ONE thing at a time and re-test so you know what fixed it. Once found, add a test that reproduces it before fixing, so it cannot silently return.',
    'Debug as a search: classify the failure (compile / crash / wrong output / hang) to point at the cause, reduce to a minimal reproducible example, then narrow the location with a hypothesis + breakpoints/stepping/watches or by bisecting. Change one thing at a time; capture it with a test before fixing.',
    'intermediate',
    6,
    4890,
    true
  ),
  (
    'cpp.tooling.debugging_method.mc_first',
    'multiple_choice',
    'First step when debugging',
    'A program crashes on some inputs but not others. What is the most useful FIRST step toward finding the cause?',
    'Reduce it to a minimal reproducible example — shrink the input and remove unrelated code until the smallest case still crashes. That often reveals the cause and makes every later step (debugger, sanitizer) faster. Rewriting from scratch or scattering random changes is not systematic.',
    'intermediate',
    2,
    4900,
    true
  ),
  (
    'cpp.tooling.unit_testing.lesson',
    'lesson',
    'Writing good unit tests',
    'A good unit test checks ONE behavior and reads in three clear parts — arrange, act, assert (AAA): arrange the inputs and the object under test, act by calling the one thing being tested, assert the expected result. Keep each test small and named for the behavior it pins down (for example handles_empty_input or rejects_duplicate_key) so a failure name tells you what broke. Prefer many focused tests over one giant test with many assertions: when a focused test fails you know exactly which behavior regressed. Tests should be FAST and DETERMINISTIC — same result every run — so they can run on every change; a test that depends on wall-clock time, random seeds, threads, or the network is flaky and erodes trust. Cover the normal case plus the boundaries (empty, single, max) and at least one error case. Tests also document intent: a reader learns how the unit is meant to behave by reading its tests. Write the assertion as the specific expected value, not just no exception thrown, so the test actually constrains behavior.',
    'A unit test checks one behavior in arrange/act/assert form, named for that behavior, fast and deterministic. Prefer many focused tests over one big one; cover normal + boundary + an error case; assert a specific expected value. Avoid time/random/thread/network dependence (flaky).',
    'intermediate',
    5,
    4910,
    true
  ),
  (
    'cpp.tooling.unit_testing.mc_aaa',
    'multiple_choice',
    'Structure of a unit test',
    'What does the arrange / act / assert structure of a unit test mean?',
    'Arrange the inputs and the object under test, act by invoking the one behavior being tested, then assert the expected result. It keeps each test focused on a single behavior and easy to read.',
    'intermediate',
    2,
    4920,
    true
  ),
  (
    'cpp.tooling.regression_testing.lesson',
    'lesson',
    'Regression tests and determinism',
    'When you find a bug, write a test that REPRODUCES it before you fix it — a regression test. The test should FAIL on the current (buggy) code and PASS once the fix lands; that proves your fix actually addresses the reported behavior, and the test stays in the suite so the same bug cannot silently come back later. This is the discipline behind test-driven bug fixing: red (failing test that captures the bug), green (minimal fix), refactor. For the test to be a reliable gate it must be DETERMINISTIC — it must give the same verdict every run regardless of when or where it runs. Remove hidden inputs: inject the clock instead of calling the real time, seed or stub randomness, avoid real network/filesystem/threads (use fakes or fixed fixtures), and do not depend on map/iteration order that is not guaranteed. A flaky test that fails intermittently is worse than no test, because people learn to ignore it. Treat the test suite as a release gate: keep it green, and a red test blocks the change until understood.',
    'Capture a bug with a failing test first (red), then make it pass with the fix (green) — the regression test proves the fix and stops the bug returning. Keep tests deterministic by injecting the clock, seeding/stubbing randomness, and avoiding real network/threads/unspecified order. Flaky tests are worse than none; the suite is a release gate.',
    'intermediate',
    5,
    4930,
    true
  ),
  (
    'cpp.tooling.regression_testing.mc_first',
    'multiple_choice',
    'Fixing a reported bug',
    'You receive a clear bug report. Before changing the code, what should you do first?',
    'Write a test that reproduces the bug — it should fail on the current code and pass after the fix, proving the fix works and preventing the bug from returning. Patching without a reproducing test risks fixing the wrong thing and offers no guard against regression.',
    'intermediate',
    2,
    4940,
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
  ('cpp.tooling.debugging_method.lesson', 'cpp.tooling.debugging_method', true),
  ('cpp.tooling.debugging_method.mc_first', 'cpp.tooling.debugging_method', true),
  ('cpp.tooling.unit_testing.lesson', 'cpp.tooling.unit_testing', true),
  ('cpp.tooling.unit_testing.mc_aaa', 'cpp.tooling.unit_testing', true),
  ('cpp.tooling.regression_testing.lesson', 'cpp.tooling.regression_testing', true),
  ('cpp.tooling.regression_testing.mc_first', 'cpp.tooling.regression_testing', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.tooling.debugging_method.mc_first.a', 'cpp.tooling.debugging_method.mc_first', 'Reduce it to a minimal reproducible example', true, 10),
  ('cpp.tooling.debugging_method.mc_first.b', 'cpp.tooling.debugging_method.mc_first', 'Rewrite the function from scratch', false, 20),
  ('cpp.tooling.debugging_method.mc_first.c', 'cpp.tooling.debugging_method.mc_first', 'Make several random changes and re-run', false, 30),
  ('cpp.tooling.debugging_method.mc_first.d', 'cpp.tooling.debugging_method.mc_first', 'Add a try/catch around everything', false, 40),
  ('cpp.tooling.unit_testing.mc_aaa.a', 'cpp.tooling.unit_testing.mc_aaa', 'Arrange inputs, act by calling the behavior, assert the expected result', true, 10),
  ('cpp.tooling.unit_testing.mc_aaa.b', 'cpp.tooling.unit_testing.mc_aaa', 'Allocate, append, archive the data', false, 20),
  ('cpp.tooling.unit_testing.mc_aaa.c', 'cpp.tooling.unit_testing.mc_aaa', 'Run the test three times for reliability', false, 30),
  ('cpp.tooling.unit_testing.mc_aaa.d', 'cpp.tooling.unit_testing.mc_aaa', 'Assert first, then arrange and act', false, 40),
  ('cpp.tooling.regression_testing.mc_first.a', 'cpp.tooling.regression_testing.mc_first', 'Write a failing test that reproduces the bug, then fix until it passes', true, 10),
  ('cpp.tooling.regression_testing.mc_first.b', 'cpp.tooling.regression_testing.mc_first', 'Patch the code immediately and move on', false, 20),
  ('cpp.tooling.regression_testing.mc_first.c', 'cpp.tooling.regression_testing.mc_first', 'Disable the failing feature', false, 30),
  ('cpp.tooling.regression_testing.mc_first.d', 'cpp.tooling.regression_testing.mc_first', 'Add logging and wait for it to recur', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
