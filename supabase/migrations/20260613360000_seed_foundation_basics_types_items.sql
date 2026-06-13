-- Learning content for the foundation program-basics and values/types skills
-- (#66). Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.program_basics.structure.lesson',
    'lesson',
    'A minimal C++ program',
    'A C++ program is built from functions, and execution begins in `int main()`. `main` returns an `int` to the operating system, where `0` means success. Statements end with a semicolon, and `#include <...>` brings in library facilities such as `<iostream>`. Example:\n\n```cpp\n#include <iostream>\nint main() {\n  std::cout << "Hello";\n  return 0;\n}\n```',
    'Every standard C++ program has exactly one main(). Returning 0 signals success; the compiler even lets you omit the return in main (it defaults to 0).',
    'beginner',
    3,
    1
  ),
  (
    'cpp.program_basics.structure.mc_entry',
    'multiple_choice',
    'Where a program starts',
    'Where does a standard C++ program begin executing?',
    'Execution begins in the `main` function regardless of where it appears in the file. #include lines and other functions do not run on their own.',
    'beginner',
    2,
    2
  ),
  (
    'cpp.program_basics.io.lesson',
    'lesson',
    'Console input and output',
    'The `<iostream>` header provides `std::cout` for output and `std::cin` for input. `std::cout << value;` prints a value, and `<<` chains: `std::cout << "x = " << x << "\\n";`. `std::cin >> x;` reads a value from the keyboard into `x`. Use `"\\n"` or `std::endl` to end a line.',
    'Think of << as "send to output" and >> as "read from input". They can be chained to handle several values in one statement.',
    'beginner',
    3,
    3
  ),
  (
    'cpp.program_basics.io.mc_read',
    'multiple_choice',
    'Reading input',
    'Which statement reads a value typed by the user into an `int x`?',
    '`std::cin >> x;` extracts input into x. `std::cout << x;` prints x instead of reading it.',
    'beginner',
    2,
    4
  ),
  (
    'cpp.values_types.variables.lesson',
    'lesson',
    'Variables and fundamental types',
    'A variable has a type and a name, and should be initialized when declared: `int count = 0;`. Fundamental types include `int` (whole numbers), `double` (floating point), `bool` (true/false), and `char` (a single character). `auto` deduces the type from the initializer (`auto n = 0;` is an int), `const` marks a value that must not change, and `constexpr` marks a compile-time constant.',
    'Prefer initializing on declaration to avoid using an indeterminate value. Use auto when the type is obvious from the right-hand side.',
    'beginner',
    4,
    5
  ),
  (
    'cpp.values_types.variables.mc_auto',
    'multiple_choice',
    'Type deduced by auto',
    'What type does `auto x = 3.0;` give `x`?',
    'The initializer `3.0` is a double literal, so `auto` deduces `x` as `double`. `3` (no dot) would deduce `int`.',
    'beginner',
    2,
    6
  ),
  (
    'cpp.values_types.conversions.lesson',
    'lesson',
    'Conversions, truncation, and static_cast',
    'Converting between numeric types can lose information. Assigning a `double` to an `int` truncates toward zero (drops the fractional part). A *narrowing* conversion inside braces (`int x{3.9};`) is rejected by the compiler. Use `static_cast<int>(d)` to convert explicitly and signal intent. Mixing signed and unsigned values in comparisons can also give surprising results.',
    'Make lossy conversions explicit with static_cast so the intent is clear and the compiler stops warning. Watch for signed/unsigned mixing.',
    'beginner',
    4,
    7
  ),
  (
    'cpp.values_types.conversions.mc_static_cast',
    'multiple_choice',
    'Result of a cast',
    'What value does `static_cast<int>(3.9)` produce?',
    'Converting a double to an int truncates toward zero, discarding the fractional part, so the result is 3 (not rounded to 4).',
    'beginner',
    2,
    8
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
  ('cpp.program_basics.structure.lesson', 'cpp.program_basics.structure', true),
  ('cpp.program_basics.structure.mc_entry', 'cpp.program_basics.structure', true),
  ('cpp.program_basics.io.lesson', 'cpp.program_basics.io', true),
  ('cpp.program_basics.io.mc_read', 'cpp.program_basics.io', true),
  ('cpp.values_types.variables.lesson', 'cpp.values_types.variables', true),
  ('cpp.values_types.variables.mc_auto', 'cpp.values_types.variables', true),
  ('cpp.values_types.conversions.lesson', 'cpp.values_types.conversions', true),
  ('cpp.values_types.conversions.mc_static_cast', 'cpp.values_types.conversions', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.program_basics.structure.mc_entry.a', 'cpp.program_basics.structure.mc_entry', 'The main() function', true, 10),
  ('cpp.program_basics.structure.mc_entry.b', 'cpp.program_basics.structure.mc_entry', 'The first #include line', false, 20),
  ('cpp.program_basics.structure.mc_entry.c', 'cpp.program_basics.structure.mc_entry', 'The first line of the file', false, 30),
  ('cpp.program_basics.structure.mc_entry.d', 'cpp.program_basics.structure.mc_entry', 'Any function named start()', false, 40),

  ('cpp.program_basics.io.mc_read.a', 'cpp.program_basics.io.mc_read', 'std::cin >> x;', true, 10),
  ('cpp.program_basics.io.mc_read.b', 'cpp.program_basics.io.mc_read', 'std::cout << x;', false, 20),
  ('cpp.program_basics.io.mc_read.c', 'cpp.program_basics.io.mc_read', 'std::read(x);', false, 30),
  ('cpp.program_basics.io.mc_read.d', 'cpp.program_basics.io.mc_read', 'std::cin << x;', false, 40),

  ('cpp.values_types.variables.mc_auto.a', 'cpp.values_types.variables.mc_auto', 'double', true, 10),
  ('cpp.values_types.variables.mc_auto.b', 'cpp.values_types.variables.mc_auto', 'int', false, 20),
  ('cpp.values_types.variables.mc_auto.c', 'cpp.values_types.variables.mc_auto', 'float', false, 30),
  ('cpp.values_types.variables.mc_auto.d', 'cpp.values_types.variables.mc_auto', 'auto is not a real type here', false, 40),

  ('cpp.values_types.conversions.mc_static_cast.a', 'cpp.values_types.conversions.mc_static_cast', '3 (truncated toward zero)', true, 10),
  ('cpp.values_types.conversions.mc_static_cast.b', 'cpp.values_types.conversions.mc_static_cast', '4 (rounded)', false, 20),
  ('cpp.values_types.conversions.mc_static_cast.c', 'cpp.values_types.conversions.mc_static_cast', '3.9 (unchanged)', false, 30),
  ('cpp.values_types.conversions.mc_static_cast.d', 'cpp.values_types.conversions.mc_static_cast', 'a compile error', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
