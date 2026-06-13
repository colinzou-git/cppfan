-- Learning content for the foundation control-flow and functions skills (#66).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.control_flow.conditionals.lesson',
    'lesson',
    'Conditionals: if, else, and switch',
    'An `if (condition) { ... } else { ... }` runs one branch based on a `bool` condition built from comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`) and logical operators (`&&`, `||`, `!`). Chain choices with `else if`. A `switch` selects among integer or enum cases; put a `break` at the end of each case, or execution falls through into the next case.',
    'Use == for comparison (not =, which assigns). In a switch, missing break causes fall-through, which is a common bug.',
    'beginner',
    4,
    9
  ),
  (
    'cpp.control_flow.conditionals.mc_fallthrough',
    'multiple_choice',
    'Forgetting break in a switch',
    'In a `switch`, what happens if a case does not end with `break`?',
    'Without break, execution falls through and continues running the statements of the following case(s) until a break or the end of the switch.',
    'beginner',
    2,
    10
  ),
  (
    'cpp.control_flow.loops.lesson',
    'lesson',
    'Loops: for, while, break, continue',
    'A `for (init; condition; step)` loop is ideal for counting; a `while (condition)` loop repeats until the condition is false. `break` exits the loop immediately; `continue` skips to the next iteration. To visit indices `0` to `n - 1` exactly once, use `for (int i = 0; i < n; ++i)`. Using `<=` or starting at the wrong index causes off-by-one errors.',
    'The condition `i < n` (with i starting at 0) visits each of the n elements once. `i <= n` runs one time too many.',
    'beginner',
    4,
    11
  ),
  (
    'cpp.control_flow.loops.mc_offbyone',
    'multiple_choice',
    'Looping over n elements',
    'To visit indices `0` through `n - 1` exactly once with `for (int i = 0; <cond>; ++i)`, what should `<cond>` be?',
    '`i < n` runs for i = 0..n-1, visiting each of the n elements once. `i <= n` overruns by one (out of bounds); `i < n - 1` skips the last element.',
    'beginner',
    2,
    12
  ),
  (
    'cpp.functions.basics.lesson',
    'lesson',
    'Function basics',
    'A function has a return type, a name, parameters, and a body: `int add(int a, int b) { return a + b; }`. By default parameters are copies of the arguments, so changing them does not affect the caller. Variables declared inside a function are local to it and disappear when it returns. A function must be declared (or defined) before the line that calls it.',
    'Parameters are local copies unless you take them by reference. Local variables exist only during the call.',
    'beginner',
    4,
    13
  ),
  (
    'cpp.functions.basics.mc_scope',
    'multiple_choice',
    'Scope of a local variable',
    'What is the scope of a variable declared inside a function body?',
    'A variable declared in a function body is local: it is visible only within that function (and the block it is declared in) and does not exist outside the call.',
    'beginner',
    2,
    14
  ),
  (
    'cpp.functions.decomposition.lesson',
    'lesson',
    'Decomposition and headers',
    'Break a large task into small, well-named functions that each do one thing — this makes code easier to read, test, and reuse. In larger projects, put function declarations in a header file (`.h`) and their definitions in a source file (`.cpp`), so other files can include the header and call the functions. Avoid giant functions that do many unrelated things.',
    'Small functions with clear names are the building blocks of readable C++. Headers share declarations; source files hold the definitions.',
    'beginner',
    4,
    15
  ),
  (
    'cpp.functions.decomposition.mc_why',
    'multiple_choice',
    'Why decompose into functions',
    'What is the main reason to split a large function into several smaller ones?',
    'Smaller, single-purpose functions are easier to read, test, and reuse. It is a design/clarity benefit, not a performance trick or a language requirement.',
    'beginner',
    2,
    16
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
  ('cpp.control_flow.conditionals.lesson', 'cpp.control_flow.conditionals', true),
  ('cpp.control_flow.conditionals.mc_fallthrough', 'cpp.control_flow.conditionals', true),
  ('cpp.control_flow.loops.lesson', 'cpp.control_flow.loops', true),
  ('cpp.control_flow.loops.mc_offbyone', 'cpp.control_flow.loops', true),
  ('cpp.functions.basics.lesson', 'cpp.functions.basics', true),
  ('cpp.functions.basics.mc_scope', 'cpp.functions.basics', true),
  ('cpp.functions.decomposition.lesson', 'cpp.functions.decomposition', true),
  ('cpp.functions.decomposition.mc_why', 'cpp.functions.decomposition', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.control_flow.conditionals.mc_fallthrough.a', 'cpp.control_flow.conditionals.mc_fallthrough', 'Execution falls through into the next case', true, 10),
  ('cpp.control_flow.conditionals.mc_fallthrough.b', 'cpp.control_flow.conditionals.mc_fallthrough', 'It is a compile error', false, 20),
  ('cpp.control_flow.conditionals.mc_fallthrough.c', 'cpp.control_flow.conditionals.mc_fallthrough', 'Nothing; break is automatic', false, 30),
  ('cpp.control_flow.conditionals.mc_fallthrough.d', 'cpp.control_flow.conditionals.mc_fallthrough', 'The program crashes at runtime', false, 40),

  ('cpp.control_flow.loops.mc_offbyone.a', 'cpp.control_flow.loops.mc_offbyone', 'i < n', true, 10),
  ('cpp.control_flow.loops.mc_offbyone.b', 'cpp.control_flow.loops.mc_offbyone', 'i <= n', false, 20),
  ('cpp.control_flow.loops.mc_offbyone.c', 'cpp.control_flow.loops.mc_offbyone', 'i < n - 1', false, 30),
  ('cpp.control_flow.loops.mc_offbyone.d', 'cpp.control_flow.loops.mc_offbyone', 'i != n + 1', false, 40),

  ('cpp.functions.basics.mc_scope.a', 'cpp.functions.basics.mc_scope', 'Local to that function (and its blocks)', true, 10),
  ('cpp.functions.basics.mc_scope.b', 'cpp.functions.basics.mc_scope', 'Global to the whole program', false, 20),
  ('cpp.functions.basics.mc_scope.c', 'cpp.functions.basics.mc_scope', 'Visible to every function in the file', false, 30),
  ('cpp.functions.basics.mc_scope.d', 'cpp.functions.basics.mc_scope', 'Shared with the caller automatically', false, 40),

  ('cpp.functions.decomposition.mc_why.a', 'cpp.functions.decomposition.mc_why', 'Readability, testability, and reuse', true, 10),
  ('cpp.functions.decomposition.mc_why.b', 'cpp.functions.decomposition.mc_why', 'It always makes the program run faster', false, 20),
  ('cpp.functions.decomposition.mc_why.c', 'cpp.functions.decomposition.mc_why', 'C++ requires functions under 10 lines', false, 30),
  ('cpp.functions.decomposition.mc_why.d', 'cpp.functions.decomposition.mc_why', 'It uses more memory', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
