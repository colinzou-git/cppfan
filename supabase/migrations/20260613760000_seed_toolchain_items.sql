-- Roadmap #71 / #113 (tooling follow-up): learning items for warnings-as-errors,
-- sanitizers, and CMake builds.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.tooling.warnings.lesson',
    'lesson',
    'Warnings and warnings-as-errors',
    'Compiler warnings flag code that compiles but is probably wrong — an unused variable, a signed/unsigned comparison, a function that falls off the end without returning. Turn them on: -Wall -Wextra (and often -Wpedantic) on GCC/Clang surface the common mistakes, and many real bugs show up first as a warning you would otherwise ignore. The discipline that keeps them useful is -Werror, which makes any warning fail the build. Without it, warnings accumulate until nobody reads them; with it, the codebase stays clean because a new warning stops CI immediately. In practice teams enable a strong warning set plus -Werror in CI, and treat a warning as a defect to fix, not noise to scroll past.',
    '-Wall -Wextra enable strong warnings that catch likely bugs; -Werror promotes them to build failures so warnings never pile up unread.',
    'intermediate',
    4,
    3150,
    true
  ),
  (
    'cpp.tooling.warnings.mc_werror',
    'multiple_choice',
    'Why -Werror',
    'What does compiling with -Werror do, and why is it useful?',
    '-Werror turns warnings into errors that fail the build, so warnings cannot accumulate unnoticed — every new one must be fixed (or explicitly suppressed) before the code merges.',
    'intermediate',
    2,
    3160,
    true
  ),
  (
    'cpp.tooling.sanitizers.lesson',
    'lesson',
    'Address and UB sanitizers',
    'Sanitizers are compiler instrumentation that catch bugs while the program runs, with a clear report instead of silent corruption. AddressSanitizer (-fsanitize=address) detects heap/stack buffer overflows, use-after-free, and leaks. UndefinedBehaviorSanitizer (-fsanitize=undefined) flags signed overflow, invalid casts, null dereferences, and other UB. You enable them at build time — g++ -fsanitize=address,undefined -g — and run your tests; on a violation the program aborts with the faulting line and a stack trace. They add run-time overhead, so they are used in debug/test/CI builds rather than shipped in Release. (ThreadSanitizer similarly finds data races but runs in a separate build.) Sanitizer-backed tests turn "works on my machine" UB into a reproducible, located failure.',
    'ASan (-fsanitize=address) catches memory errors (overflow/use-after-free/leaks); UBSan (-fsanitize=undefined) catches undefined behavior. Use them in debug/test/CI builds, not Release.',
    'advanced',
    5,
    3170,
    true
  ),
  (
    'cpp.tooling.sanitizers.mc_asan',
    'multiple_choice',
    'What AddressSanitizer catches',
    'Which kind of bug is AddressSanitizer (-fsanitize=address) designed to catch?',
    'ASan targets memory errors — heap/stack buffer overflows, use-after-free, and leaks — reporting the faulting access and a stack trace instead of letting the program corrupt memory silently.',
    'advanced',
    2,
    3180,
    true
  ),
  (
    'cpp.tooling.cmake.lesson',
    'lesson',
    'CMake builds',
    'CMake describes a build in CMakeLists.txt so the same project compiles across compilers and IDEs. The essentials: add_executable(app main.cpp) (or add_library(...)) defines a target; target_include_directories(app PRIVATE include) adds header search paths; target_link_libraries(app PRIVATE fmt) links dependencies. You configure once (cmake -S . -B build) then build (cmake --build build). Choose a build type with -DCMAKE_BUILD_TYPE=Debug (no optimization, full debug info, assertions) or Release (optimized, NDEBUG); Debug is for developing and sanitizer runs, Release for shipping. Thinking in targets — each with its own includes, definitions, and links — keeps large projects modular instead of relying on one global flag soup.',
    'CMake builds around targets: add_executable/add_library, then target_include_directories/target_link_libraries. Pick CMAKE_BUILD_TYPE=Debug for development/sanitizers, Release for shipping.',
    'intermediate',
    5,
    3190,
    true
  ),
  (
    'cpp.tooling.cmake.mc_link',
    'multiple_choice',
    'Linking a library in CMake',
    'Which CMake command links an external library into your executable target?',
    'target_link_libraries(<target> PRIVATE <lib>) links a dependency to a target. add_executable defines the target; target_include_directories adds header paths.',
    'intermediate',
    2,
    3200,
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
  ('cpp.tooling.warnings.lesson', 'cpp.tooling.warnings', true),
  ('cpp.tooling.warnings.mc_werror', 'cpp.tooling.warnings', true),
  ('cpp.tooling.sanitizers.lesson', 'cpp.tooling.sanitizers', true),
  ('cpp.tooling.sanitizers.mc_asan', 'cpp.tooling.sanitizers', true),
  ('cpp.tooling.cmake.lesson', 'cpp.tooling.cmake', true),
  ('cpp.tooling.cmake.mc_link', 'cpp.tooling.cmake', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.tooling.warnings.mc_werror.a', 'cpp.tooling.warnings.mc_werror', 'It turns warnings into build-failing errors so they cannot accumulate unnoticed', true, 10),
  ('cpp.tooling.warnings.mc_werror.b', 'cpp.tooling.warnings.mc_werror', 'It silences all warnings', false, 20),
  ('cpp.tooling.warnings.mc_werror.c', 'cpp.tooling.warnings.mc_werror', 'It speeds up compilation', false, 30),
  ('cpp.tooling.warnings.mc_werror.d', 'cpp.tooling.warnings.mc_werror', 'It enables optimizations', false, 40),
  ('cpp.tooling.sanitizers.mc_asan.a', 'cpp.tooling.sanitizers.mc_asan', 'Memory errors: buffer overflows, use-after-free, and leaks', true, 10),
  ('cpp.tooling.sanitizers.mc_asan.b', 'cpp.tooling.sanitizers.mc_asan', 'Slow algorithms with poor Big-O', false, 20),
  ('cpp.tooling.sanitizers.mc_asan.c', 'cpp.tooling.sanitizers.mc_asan', 'Spelling mistakes in comments', false, 30),
  ('cpp.tooling.sanitizers.mc_asan.d', 'cpp.tooling.sanitizers.mc_asan', 'Missing header includes', false, 40),
  ('cpp.tooling.cmake.mc_link.a', 'cpp.tooling.cmake.mc_link', 'target_link_libraries(app PRIVATE lib)', true, 10),
  ('cpp.tooling.cmake.mc_link.b', 'cpp.tooling.cmake.mc_link', 'add_executable(app main.cpp)', false, 20),
  ('cpp.tooling.cmake.mc_link.c', 'cpp.tooling.cmake.mc_link', 'target_include_directories(app PRIVATE include)', false, 30),
  ('cpp.tooling.cmake.mc_link.d', 'cpp.tooling.cmake.mc_link', 'cmake --build build', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
