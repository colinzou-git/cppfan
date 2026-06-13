-- Learning content for the testing/debugging/error-handling/build skills (#71).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.tooling.error_handling.lesson',
    'lesson',
    'Error handling',
    'C++ reports failures in two main ways. Exceptions (`throw std::runtime_error("...")` caught by `try { ... } catch (const std::exception& e) { ... }`) unwind the stack to a handler and run destructors along the way (RAII makes this safe). Error returns (a status code or `std::optional`/`std::expected`) make failure part of the value. Use exceptions for exceptional, hard-to-handle-locally errors; use return values for expected, routine failures.',
    'Exceptions unwind to a handler and run destructors (so RAII cleans up). Prefer return-value errors for expected outcomes and exceptions for truly exceptional ones.',
    'intermediate',
    4,
    1910
  ),
  (
    'cpp.tooling.error_handling.mc_unwind',
    'multiple_choice',
    'What happens when an exception is thrown',
    'When an exception is thrown and caught higher up, what happens to local objects in between?',
    'Stack unwinding destroys the local objects between the throw and the handler, running their destructors — which is why RAII makes exception handling safe.',
    'intermediate',
    2,
    1920
  ),
  (
    'cpp.tooling.testing.lesson',
    'lesson',
    'Testing',
    'A unit test calls your code with known inputs and checks the output against the expected result, failing loudly when they differ. A good bug-fix workflow writes a test that fails before the fix and passes after, locking the bug out for good. Frameworks like GoogleTest or Catch2 structure tests and assertions; even a few `assert`-style checks are far better than manual inspection.',
    'Tests turn "I think it works" into "it is verified". Write a failing test first, then make it pass.',
    'intermediate',
    4,
    1930
  ),
  (
    'cpp.tooling.testing.mc_regression',
    'multiple_choice',
    'A good bug-fix workflow',
    'What is the recommended way to fix a bug so it stays fixed?',
    'Write a test that reproduces the bug (fails before the fix) and passes after the fix. The test guards against the bug returning.',
    'intermediate',
    2,
    1940
  ),
  (
    'cpp.tooling.debugging.lesson',
    'lesson',
    'Debugging',
    'When code misbehaves, reproduce it reliably with the smallest input you can, then narrow down where the actual differs from the expected. A debugger (gdb/lldb or an IDE) lets you set breakpoints, step line by line, and inspect variables; targeted print/log statements work too. Change one thing at a time and re-check, rather than guessing broadly.',
    'Reproduce small, then bisect: find the first point where state goes wrong. A debugger and a minimal repro beat random edits.',
    'intermediate',
    4,
    1950
  ),
  (
    'cpp.tooling.debugging.mc_firststep',
    'multiple_choice',
    'First step when debugging',
    'What is a good first step when investigating a bug?',
    'Get a small, reliable reproduction. Once you can trigger the bug consistently with minimal input, you can bisect to the cause.',
    'intermediate',
    2,
    1960
  ),
  (
    'cpp.tooling.build.lesson',
    'lesson',
    'Compiling and building',
    'Building a C++ program has two key stages: compiling each source file into an object file (syntax/type checks happen here), then linking the object files and libraries into an executable (unresolved symbols are errors here). A build system like CMake describes targets and dependencies so the right files are compiled and linked with one command, instead of typing compiler invocations by hand.',
    'A "compile error" is in one file; an "undefined reference" is usually a link error (a definition is missing). Build systems automate the compile+link steps.',
    'intermediate',
    4,
    1970
  ),
  (
    'cpp.tooling.build.mc_linkstage',
    'multiple_choice',
    'Compile vs link',
    'An "undefined reference to foo()" error most likely comes from which stage?',
    'That is a linker error: the code compiled, but no definition of foo() was found to link against. Compile errors are about syntax/types within a single translation unit.',
    'intermediate',
    2,
    1980
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
  ('cpp.tooling.error_handling.lesson', 'cpp.tooling.error_handling', true),
  ('cpp.tooling.error_handling.mc_unwind', 'cpp.tooling.error_handling', true),
  ('cpp.tooling.testing.lesson', 'cpp.tooling.testing', true),
  ('cpp.tooling.testing.mc_regression', 'cpp.tooling.testing', true),
  ('cpp.tooling.debugging.lesson', 'cpp.tooling.debugging', true),
  ('cpp.tooling.debugging.mc_firststep', 'cpp.tooling.debugging', true),
  ('cpp.tooling.build.lesson', 'cpp.tooling.build', true),
  ('cpp.tooling.build.mc_linkstage', 'cpp.tooling.build', true),
  ('cpp.tooling.error_handling.lesson', 'cpp.raii.exception_safety_intro', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.tooling.error_handling.mc_unwind.a', 'cpp.tooling.error_handling.mc_unwind', 'They are destroyed by stack unwinding (their destructors run)', true, 10),
  ('cpp.tooling.error_handling.mc_unwind.b', 'cpp.tooling.error_handling.mc_unwind', 'They leak; destructors are skipped', false, 20),
  ('cpp.tooling.error_handling.mc_unwind.c', 'cpp.tooling.error_handling.mc_unwind', 'They are copied to the handler', false, 30),
  ('cpp.tooling.error_handling.mc_unwind.d', 'cpp.tooling.error_handling.mc_unwind', 'Nothing happens until the program exits', false, 40),

  ('cpp.tooling.testing.mc_regression.a', 'cpp.tooling.testing.mc_regression', 'Write a test that fails before the fix and passes after', true, 10),
  ('cpp.tooling.testing.mc_regression.b', 'cpp.tooling.testing.mc_regression', 'Inspect the output once by hand and move on', false, 20),
  ('cpp.tooling.testing.mc_regression.c', 'cpp.tooling.testing.mc_regression', 'Add a try/catch around the whole program', false, 30),
  ('cpp.tooling.testing.mc_regression.d', 'cpp.tooling.testing.mc_regression', 'Delete the failing code path', false, 40),

  ('cpp.tooling.debugging.mc_firststep.a', 'cpp.tooling.debugging.mc_firststep', 'Get a small, reliable reproduction of the bug', true, 10),
  ('cpp.tooling.debugging.mc_firststep.b', 'cpp.tooling.debugging.mc_firststep', 'Rewrite large parts at random', false, 20),
  ('cpp.tooling.debugging.mc_firststep.c', 'cpp.tooling.debugging.mc_firststep', 'Disable the compiler warnings', false, 30),
  ('cpp.tooling.debugging.mc_firststep.d', 'cpp.tooling.debugging.mc_firststep', 'Ship it and wait for reports', false, 40),

  ('cpp.tooling.build.mc_linkstage.a', 'cpp.tooling.build.mc_linkstage', 'The link stage (a definition is missing)', true, 10),
  ('cpp.tooling.build.mc_linkstage.b', 'cpp.tooling.build.mc_linkstage', 'The compile stage (a syntax error)', false, 20),
  ('cpp.tooling.build.mc_linkstage.c', 'cpp.tooling.build.mc_linkstage', 'Runtime', false, 30),
  ('cpp.tooling.build.mc_linkstage.d', 'cpp.tooling.build.mc_linkstage', 'Preprocessing only', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
