-- Roadmap #66 / #108 (values/types follow-up): learning items for
-- fundamental-type selection, signed/unsigned pitfalls, and literals/expressions.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.values_types.fundamental_types.lesson',
    'lesson',
    'Choosing a fundamental type',
    'C++ gives you a few fundamental types, and picking the right one matters. Use int for whole numbers (counts, indices) — it is exact, but has a limited range, so use a wider type like long long for very large values. Use double for real numbers and measurements; it is approximate, so equality comparisons like 0.1 + 0.2 == 0.3 can be false and money is better stored in integer cents than in double. Use bool for true/false flags rather than an int 0/1. Use char for a single character/byte. The guiding questions: does the value need a fractional part (then double), is it a yes/no (then bool), how large can it get (size the integer accordingly)? Choosing by intent makes code clearer and avoids precision and overflow surprises.',
    'int for exact whole numbers (widen to long long for big values), double for approximate reals (avoid == and money), bool for flags, char for one character. Choose by range and intent.',
    'beginner',
    4,
    3270,
    true
  ),
  (
    'cpp.values_types.fundamental_types.mc_money',
    'multiple_choice',
    'Picking a type for money',
    'Why is double a poor choice for storing exact money amounts like $0.10?',
    'double is binary floating point and cannot represent most decimal fractions exactly, so values like 0.10 are approximate and sums drift. Store money as integer cents (an exact int) instead.',
    'beginner',
    2,
    3280,
    true
  ),
  (
    'cpp.values_types.signed_unsigned.lesson',
    'lesson',
    'Signed and unsigned pitfalls',
    'Mixing signed and unsigned integers is a classic bug source. Unsigned types cannot represent negatives: unsigned int u = 0; u - 1 does not give -1, it wraps around to a huge value (modular arithmetic). When you compare a signed and an unsigned value, the signed one is converted to unsigned first, so int i = -1; unsigned u = 1; i < u is false — because -1 becomes a large unsigned number. This bites most often with container sizes: v.size() returns an unsigned size_t, so a loop like for (int i = 0; i <= v.size() - 1; ++i) breaks when v is empty (0u - 1 is huge). Prefer signed indices, range-based for loops, or cast deliberately, and enable -Wsign-compare so the compiler flags risky mixes.',
    'Unsigned cannot be negative and wraps (0u - 1 is huge); signed/unsigned comparisons convert the signed value to unsigned, so -1 < 1u is false. Beware loops using container .size().',
    'intermediate',
    5,
    3290,
    true
  ),
  (
    'cpp.values_types.signed_unsigned.mc_compare',
    'multiple_choice',
    'A signed/unsigned comparison',
    'With int i = -1; unsigned u = 1;, what does i < u evaluate to in C++?',
    'false. The signed -1 is converted to unsigned for the comparison, becoming a very large value, so it is not less than 1. This surprising result is the core signed/unsigned pitfall.',
    'intermediate',
    2,
    3300,
    true
  ),
  (
    'cpp.values_types.literals.lesson',
    'lesson',
    'Literals and expression evaluation',
    'A literal is a value written directly in code: 42 (int), 42LL (long long), 3.14 (double), 3.14f (float), ''A'' (char), true (bool), "hi" (string literal). The literal''s form determines its type, which then drives how an expression evaluates. The biggest beginner trap is integer division: 7 / 2 is 3, not 3.5, because both operands are int — the fractional part is discarded and % gives the remainder (7 % 2 == 1). To get 3.5 you make an operand floating point: 7.0 / 2 or 7 / 2.0. Operator precedence also matters: 2 + 3 * 4 is 14, not 20, because * binds tighter than +; use parentheses when in doubt. Reading the literal types first makes an expression''s result predictable.',
    'A literal''s form sets its type. Integer division truncates (7 / 2 == 3); make an operand floating point (7.0 / 2) for a real result. Respect precedence (* before +) or parenthesize.',
    'beginner',
    4,
    3310,
    true
  ),
  (
    'cpp.values_types.literals.mc_intdiv',
    'multiple_choice',
    'Integer division',
    'In C++, what is the value of the expression 7 / 2?',
    'Both operands are int, so this is integer division: the result is 3 (the fractional part is discarded). Use 7.0 / 2 to get 3.5.',
    'beginner',
    1,
    3320,
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
  ('cpp.values_types.fundamental_types.lesson', 'cpp.values_types.fundamental_types', true),
  ('cpp.values_types.fundamental_types.mc_money', 'cpp.values_types.fundamental_types', true),
  ('cpp.values_types.signed_unsigned.lesson', 'cpp.values_types.signed_unsigned', true),
  ('cpp.values_types.signed_unsigned.mc_compare', 'cpp.values_types.signed_unsigned', true),
  ('cpp.values_types.literals.lesson', 'cpp.values_types.literals', true),
  ('cpp.values_types.literals.mc_intdiv', 'cpp.values_types.literals', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.values_types.fundamental_types.mc_money.a', 'cpp.values_types.fundamental_types.mc_money', 'double is binary floating point, so decimals like 0.10 are approximate and drift', true, 10),
  ('cpp.values_types.fundamental_types.mc_money.b', 'cpp.values_types.fundamental_types.mc_money', 'double cannot hold numbers below 1.0', false, 20),
  ('cpp.values_types.fundamental_types.mc_money.c', 'cpp.values_types.fundamental_types.mc_money', 'double is slower than int for all programs', false, 30),
  ('cpp.values_types.fundamental_types.mc_money.d', 'cpp.values_types.fundamental_types.mc_money', 'double rounds every value to two decimal places', false, 40),
  ('cpp.values_types.signed_unsigned.mc_compare.a', 'cpp.values_types.signed_unsigned.mc_compare', 'false (the signed -1 converts to a large unsigned value)', true, 10),
  ('cpp.values_types.signed_unsigned.mc_compare.b', 'cpp.values_types.signed_unsigned.mc_compare', 'true (-1 is less than 1)', false, 20),
  ('cpp.values_types.signed_unsigned.mc_compare.c', 'cpp.values_types.signed_unsigned.mc_compare', 'It is a compile error', false, 30),
  ('cpp.values_types.signed_unsigned.mc_compare.d', 'cpp.values_types.signed_unsigned.mc_compare', 'It throws an exception at run time', false, 40),
  ('cpp.values_types.literals.mc_intdiv.a', 'cpp.values_types.literals.mc_intdiv', '3', true, 10),
  ('cpp.values_types.literals.mc_intdiv.b', 'cpp.values_types.literals.mc_intdiv', '3.5', false, 20),
  ('cpp.values_types.literals.mc_intdiv.c', 'cpp.values_types.literals.mc_intdiv', '4', false, 30),
  ('cpp.values_types.literals.mc_intdiv.d', 'cpp.values_types.literals.mc_intdiv', '2', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
