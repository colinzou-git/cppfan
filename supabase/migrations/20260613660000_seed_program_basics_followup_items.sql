-- Roadmap #66 / #108 (program-basics follow-up): learning items for
-- statements/comments/naming, main() exit status, and error kinds.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.program_basics.statements_comments.lesson',
    'lesson',
    'Statements, comments, and naming',
    'A C++ statement is a single instruction and ends with a semicolon ; — forgetting it is one of the most common beginner compile errors. Comments document intent and are ignored by the compiler: // starts a line comment that runs to the end of the line, and /* ... */ is a block comment that can span lines. Names should be descriptive and follow a consistent convention (e.g. snake_case or camelCase for variables and functions, PascalCase for types). Avoid names that start with an underscore followed by a capital, or that contain a double underscore — those are reserved for the implementation. Good names plus comments explaining why (not what) keep code readable.',
    'Statements end with ;; // and /* */ write comments; names should be descriptive and follow one consistent convention, avoiding reserved underscore patterns.',
    'beginner',
    4,
    2810,
    true
  ),
  (
    'cpp.program_basics.statements_comments.mc_terminate',
    'multiple_choice',
    'Ending a statement',
    'What punctuation ends a normal C++ statement?',
    'A semicolon ; terminates a statement. Leaving it off is a frequent compile error reported on or near the following line.',
    'beginner',
    1,
    2820,
    true
  ),
  (
    'cpp.program_basics.exit_status.lesson',
    'lesson',
    'main() return value and exit status',
    'main() returns an int that becomes the program''s exit status — the value the operating system (and shells, scripts, and CI) use to tell whether the program succeeded. By convention return 0; means success and any non-zero value signals an error (you can use EXIT_SUCCESS/EXIT_FAILURE from <cstdlib>). main is special: if you omit the return, the compiler treats it as return 0;. So a program that finishes normally reports success even without an explicit return, while returning a non-zero code lets callers detect and react to failures.',
    'main() returns an int exit status: 0 (or EXIT_SUCCESS) means success, non-zero means failure. Omitting return in main implies return 0.',
    'beginner',
    3,
    2830,
    true
  ),
  (
    'cpp.program_basics.exit_status.mc_success',
    'multiple_choice',
    'What return 0 means',
    'What does return 0; at the end of main() communicate?',
    'Returning 0 from main reports successful completion to the operating system. A non-zero value signals that something went wrong.',
    'beginner',
    1,
    2840,
    true
  ),
  (
    'cpp.program_basics.error_kinds.lesson',
    'lesson',
    'Compile-time, link-time, and run-time errors',
    'Errors surface at three different stages. Compile-time errors are caught by the compiler while translating one source file — syntax mistakes, type errors, and undeclared names; the program never builds. Link-time errors happen after compiling, when the linker combines object files and cannot resolve a symbol — typically a function that is declared and called but never defined, or defined twice. Run-time errors occur while the built program executes — crashes like dereferencing a null pointer or dividing by zero, and logic errors that produce wrong output. Knowing which stage failed tells you where to look: the compiler message, the linker message, or the program''s behavior.',
    'Compile-time: the compiler rejects one file (syntax/type/undeclared). Link-time: the linker cannot resolve/duplicate a symbol. Run-time: the built program misbehaves while running.',
    'beginner',
    4,
    2850,
    true
  ),
  (
    'cpp.program_basics.error_kinds.mc_classify',
    'multiple_choice',
    'Classify the error',
    'A function is declared and called, the file compiles, but the function is never defined anywhere. When does this fail?',
    'Each file compiles fine because the declaration satisfies the compiler. The failure appears at link time, when the linker looks for the missing definition and reports an unresolved symbol.',
    'beginner',
    2,
    2860,
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
  ('cpp.program_basics.statements_comments.lesson', 'cpp.program_basics.statements_comments', true),
  ('cpp.program_basics.statements_comments.mc_terminate', 'cpp.program_basics.statements_comments', true),
  ('cpp.program_basics.exit_status.lesson', 'cpp.program_basics.exit_status', true),
  ('cpp.program_basics.exit_status.mc_success', 'cpp.program_basics.exit_status', true),
  ('cpp.program_basics.error_kinds.lesson', 'cpp.program_basics.error_kinds', true),
  ('cpp.program_basics.error_kinds.mc_classify', 'cpp.program_basics.error_kinds', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.program_basics.statements_comments.mc_terminate.a', 'cpp.program_basics.statements_comments.mc_terminate', 'A semicolon ;', true, 10),
  ('cpp.program_basics.statements_comments.mc_terminate.b', 'cpp.program_basics.statements_comments.mc_terminate', 'A period .', false, 20),
  ('cpp.program_basics.statements_comments.mc_terminate.c', 'cpp.program_basics.statements_comments.mc_terminate', 'A newline', false, 30),
  ('cpp.program_basics.statements_comments.mc_terminate.d', 'cpp.program_basics.statements_comments.mc_terminate', 'A closing brace }', false, 40),
  ('cpp.program_basics.exit_status.mc_success.a', 'cpp.program_basics.exit_status.mc_success', 'The program finished successfully', true, 10),
  ('cpp.program_basics.exit_status.mc_success.b', 'cpp.program_basics.exit_status.mc_success', 'The program crashed', false, 20),
  ('cpp.program_basics.exit_status.mc_success.c', 'cpp.program_basics.exit_status.mc_success', 'main() printed zero', false, 30),
  ('cpp.program_basics.exit_status.mc_success.d', 'cpp.program_basics.exit_status.mc_success', 'The program will restart', false, 40),
  ('cpp.program_basics.error_kinds.mc_classify.a', 'cpp.program_basics.error_kinds.mc_classify', 'At link time (unresolved symbol)', true, 10),
  ('cpp.program_basics.error_kinds.mc_classify.b', 'cpp.program_basics.error_kinds.mc_classify', 'At compile time', false, 20),
  ('cpp.program_basics.error_kinds.mc_classify.c', 'cpp.program_basics.error_kinds.mc_classify', 'At run time', false, 30),
  ('cpp.program_basics.error_kinds.mc_classify.d', 'cpp.program_basics.error_kinds.mc_classify', 'It never fails', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
