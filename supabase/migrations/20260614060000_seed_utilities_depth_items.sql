-- Roadmap #80 / #121 (utilities depth): learning items for robust stream input,
-- pairs/tuples and structured bindings, and scoped enums for finite states.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.utilities.stream_validation.lesson',
    'lesson',
    'Robust stream input',
    'Reading input with `>>` can fail, and ignoring that is a common source of bugs. When `std::cin >> n` cannot parse an int (the user typed `abc`), the stream enters a failed state: `n` is left unchanged, the bad characters stay in the buffer, and every later extraction silently fails too. So always test the stream — `if (std::cin >> n) { ... }` or check `std::cin.fail()` — before trusting the value. To recover, call `std::cin.clear()` to reset the error flags, then `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), ''\n'')` to discard the rest of the bad line, and prompt again. Mixing `>>` with `std::getline` needs the same care: `>>` leaves the trailing newline in the buffer, so a following `getline` reads an empty line unless you `ignore()` that newline first. The rule: extraction is not validation — check the stream state, recover deliberately, and loop until the input is valid.',
    'Extraction can fail and leave the stream in an error state; check the stream (`if (cin >> n)`) before trusting input. Recover with clear() then ignore() to discard the bad line. After >>, ignore the leftover newline before getline.',
    'intermediate',
    5,
    3990,
    true
  ),
  (
    'cpp.utilities.stream_validation.mc_recover',
    'multiple_choice',
    'Recovering from bad input',
    '`std::cin >> n` failed because the user typed letters. What must you do before reading again?',
    'After a failed extraction you must cin.clear() to reset the error flags and cin.ignore(...) to discard the leftover bad characters; otherwise every subsequent read fails too.',
    'intermediate',
    2,
    4000,
    true
  ),
  (
    'cpp.utilities.tuples.lesson',
    'lesson',
    'Pairs, tuples, and structured bindings',
    '`std::pair<A, B>` groups two related values and `std::tuple<A, B, C, ...>` groups any fixed number — handy for returning several results from one function without defining a struct. You build them with `std::make_pair`/`std::make_tuple` (or brace init) and historically read them with `.first`/`.second` or `std::get<0>(t)`, which is clumsy. Structured bindings (C++17) fix that: `auto [quotient, remainder] = divmod(a, b);` unpacks the returned pair/tuple into named variables, and the same syntax destructures structs and elements when iterating a map (`for (auto& [key, value] : m)`). Prefer a small named struct when the group is a meaningful entity you pass around a lot (its fields document themselves); reach for pair/tuple for quick, local, ad-hoc grouping like multiple return values.',
    'std::pair/std::tuple group a fixed number of values (e.g. multiple return values); structured bindings (auto [a, b] = ...) unpack them into named variables. Prefer a named struct when the group is a meaningful, reused entity.',
    'intermediate',
    5,
    4010,
    true
  ),
  (
    'cpp.utilities.tuples.mc_bind',
    'multiple_choice',
    'Unpacking a returned pair',
    'A function returns `std::pair<int, int>`. What is the idiomatic C++17 way to read both values into named variables?',
    'Structured bindings — `auto [lo, hi] = f();` — unpack the pair into named variables in one line, far clearer than calling .first/.second or std::get separately.',
    'intermediate',
    2,
    4020,
    true
  ),
  (
    'cpp.utilities.enums.lesson',
    'lesson',
    'Scoped enums for finite states',
    'When a value can only be one of a small, fixed set of named states — `Pending`, `Active`, `Closed` — model it with a scoped enum: `enum class Status { Pending, Active, Closed };`. Scoped enums (`enum class`) are safer than old plain enums: their names are scoped (`Status::Active`, no clashes), they do not implicitly convert to int, and you can give them an explicit underlying type. The compiler can warn when a `switch` over the enum misses a case, so adding a new state surfaces every place that must handle it. Choose the right tool by what varies: an `enum class` when the alternatives are just *labels* with no data; a `std::variant` when each alternative carries a *different type of data*; and runtime polymorphism (virtual functions) when the set of alternatives is *open* and extended by new classes. Enum for a closed set of plain states, variant for a closed set of typed payloads, polymorphism for an open set.',
    'Use enum class for a closed set of named states (scoped, no implicit int conversion, switch-exhaustiveness warnings). Pick enum for plain labels, variant for typed payloads, polymorphism for an open/extensible set.',
    'intermediate',
    5,
    4030,
    true
  ),
  (
    'cpp.utilities.enums.mc_choose',
    'multiple_choice',
    'enum class vs variant',
    'You have a closed set of states that are just names with no associated data of their own. Which type models this best?',
    'An enum class fits a closed set of plain named states: scoped, type-safe, and switch-exhaustiveness-checkable. std::variant is for alternatives that each carry a different data type; polymorphism is for an open, extensible set.',
    'intermediate',
    2,
    4040,
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
  ('cpp.utilities.stream_validation.lesson', 'cpp.utilities.stream_validation', true),
  ('cpp.utilities.stream_validation.mc_recover', 'cpp.utilities.stream_validation', true),
  ('cpp.utilities.tuples.lesson', 'cpp.utilities.tuples', true),
  ('cpp.utilities.tuples.mc_bind', 'cpp.utilities.tuples', true),
  ('cpp.utilities.enums.lesson', 'cpp.utilities.enums', true),
  ('cpp.utilities.enums.mc_choose', 'cpp.utilities.enums', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.utilities.stream_validation.mc_recover.a', 'cpp.utilities.stream_validation.mc_recover', 'Call cin.clear() to reset error flags, then cin.ignore(...) to discard the bad input', true, 10),
  ('cpp.utilities.stream_validation.mc_recover.b', 'cpp.utilities.stream_validation.mc_recover', 'Nothing; the next >> automatically retries cleanly', false, 20),
  ('cpp.utilities.stream_validation.mc_recover.c', 'cpp.utilities.stream_validation.mc_recover', 'Re-declare the variable n', false, 30),
  ('cpp.utilities.stream_validation.mc_recover.d', 'cpp.utilities.stream_validation.mc_recover', 'Close and reopen std::cin', false, 40),
  ('cpp.utilities.tuples.mc_bind.a', 'cpp.utilities.tuples.mc_bind', 'auto [lo, hi] = f(); (structured bindings)', true, 10),
  ('cpp.utilities.tuples.mc_bind.b', 'cpp.utilities.tuples.mc_bind', 'Read p.first and p.second on separate lines', false, 20),
  ('cpp.utilities.tuples.mc_bind.c', 'cpp.utilities.tuples.mc_bind', 'Cast the pair to an array and index it', false, 30),
  ('cpp.utilities.tuples.mc_bind.d', 'cpp.utilities.tuples.mc_bind', 'Call std::get on the pair without a template index', false, 40),
  ('cpp.utilities.enums.mc_choose.a', 'cpp.utilities.enums.mc_choose', 'enum class', true, 10),
  ('cpp.utilities.enums.mc_choose.b', 'cpp.utilities.enums.mc_choose', 'std::variant, one alternative per state', false, 20),
  ('cpp.utilities.enums.mc_choose.c', 'cpp.utilities.enums.mc_choose', 'A base class with a virtual function per state', false, 30),
  ('cpp.utilities.enums.mc_choose.d', 'cpp.utilities.enums.mc_choose', 'A plain int with documented magic values', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
