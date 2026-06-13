-- Roadmap #66 / #108 (control-flow follow-up): learning items for logical
-- operators, switch, and loop invariants / off-by-one.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.control_flow.logical_operators.lesson',
    'lesson',
    'Logical operators and compound conditions',
    'Three logical operators combine boolean conditions: && (and) is true only when both sides are true, || (or) is true when at least one side is true, and ! (not) flips a boolean. They evaluate left to right with short-circuiting: && stops at the first false operand and || stops at the first true one, so the right-hand side may never run. That is not just an optimization — it is a safety tool: if (p != nullptr && p->ready) only dereferences p when it is non-null, and if (i < v.size() && v[i] == x) only indexes within bounds. Beware side effects on the right of a short-circuit (they may not happen), and remember && binds tighter than ||, so parenthesize mixed conditions like (a || b) && c to say what you mean.',
    '&& is true iff both sides are; || iff at least one; ! negates. Both short-circuit left-to-right, so the right operand can guard the left (e.g. null/bounds checks). Parenthesize mixed && / ||.',
    'beginner',
    4,
    3330,
    true
  ),
  (
    'cpp.control_flow.logical_operators.mc_shortcircuit',
    'multiple_choice',
    'Short-circuit safety',
    'Why is if (p != nullptr && p->ready) safe even when p is null?',
    '&& short-circuits: when p != nullptr is false the right operand p->ready is never evaluated, so the null pointer is never dereferenced.',
    'beginner',
    2,
    3340,
    true
  ),
  (
    'cpp.control_flow.switch_statement.lesson',
    'lesson',
    'switch and break',
    'A switch branches on an integral or enum value, matching it against case labels with an optional default. Each case that should stand alone must end with break; otherwise execution falls through into the next case — a frequent bug when the break is forgotten, though intentional fallthrough is sometimes used to share code between cases (mark it with [[fallthrough]] in modern C++). A switch is clearer than a long if/else if chain when comparing one value against many constants. Note that variables declared inside a case may need their own { } block scope. Use default to handle unexpected values explicitly.',
    'switch matches a value against case labels; each standalone case needs break or it falls through into the next. Prefer switch over long if/else-if on one value; handle default.',
    'beginner',
    4,
    3350,
    true
  ),
  (
    'cpp.control_flow.switch_statement.mc_nobreak',
    'multiple_choice',
    'Forgetting break',
    'What happens in a switch when a matched case has no break (and no [[fallthrough]])?',
    'Execution falls through and runs the statements of the following case(s) until a break or the end of the switch — usually a bug when the break was simply forgotten.',
    'beginner',
    2,
    3360,
    true
  ),
  (
    'cpp.control_flow.loop_invariants.lesson',
    'lesson',
    'Loop invariants and off-by-one',
    'A loop invariant is a condition that is true before the loop and stays true after every iteration; using it to reason about a loop is the most reliable way to get the bounds right. For summing an array, the invariant might be "sum holds the total of the first i elements" — which tells you i runs from 0 while i < n and that sum is complete when i == n. Off-by-one errors come from the boundary: < vs <=, starting at 0 vs 1, and whether the range is half-open [0, n) (the C++ convention, length n) or closed [0, n] (length n + 1, usually wrong for an n-element array). break exits the loop immediately; continue skips to the next iteration — both can interact with an invariant, so check it still holds at each exit point.',
    'A loop invariant holds before and after every iteration; reason with it to pick bounds. Most off-by-one bugs are < vs <= and half-open [0, n) vs closed [0, n]. break exits; continue skips.',
    'intermediate',
    5,
    3370,
    true
  ),
  (
    'cpp.control_flow.loop_invariants.mc_halfopen',
    'multiple_choice',
    'Half-open ranges',
    'For an array of length n, which half-open range [start, end) covers exactly its valid indices?',
    'Valid indices are 0..n-1. The half-open range [0, n) includes 0 up to but not including n — exactly those n indices. [0, n] and [1, n] overrun or skip.',
    'intermediate',
    2,
    3380,
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
  ('cpp.control_flow.logical_operators.lesson', 'cpp.control_flow.logical_operators', true),
  ('cpp.control_flow.logical_operators.mc_shortcircuit', 'cpp.control_flow.logical_operators', true),
  ('cpp.control_flow.switch_statement.lesson', 'cpp.control_flow.switch_statement', true),
  ('cpp.control_flow.switch_statement.mc_nobreak', 'cpp.control_flow.switch_statement', true),
  ('cpp.control_flow.loop_invariants.lesson', 'cpp.control_flow.loop_invariants', true),
  ('cpp.control_flow.loop_invariants.mc_halfopen', 'cpp.control_flow.loop_invariants', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.control_flow.logical_operators.mc_shortcircuit.a', 'cpp.control_flow.logical_operators.mc_shortcircuit', '&& short-circuits, so p->ready is not evaluated when p != nullptr is false', true, 10),
  ('cpp.control_flow.logical_operators.mc_shortcircuit.b', 'cpp.control_flow.logical_operators.mc_shortcircuit', 'Both sides always evaluate, but null dereference is allowed', false, 20),
  ('cpp.control_flow.logical_operators.mc_shortcircuit.c', 'cpp.control_flow.logical_operators.mc_shortcircuit', 'The compiler reorders the checks automatically', false, 30),
  ('cpp.control_flow.logical_operators.mc_shortcircuit.d', 'cpp.control_flow.logical_operators.mc_shortcircuit', '!= binds tighter so the null is ignored', false, 40),
  ('cpp.control_flow.switch_statement.mc_nobreak.a', 'cpp.control_flow.switch_statement.mc_nobreak', 'Execution falls through into the following case(s)', true, 10),
  ('cpp.control_flow.switch_statement.mc_nobreak.b', 'cpp.control_flow.switch_statement.mc_nobreak', 'Only the matched case runs; break is optional', false, 20),
  ('cpp.control_flow.switch_statement.mc_nobreak.c', 'cpp.control_flow.switch_statement.mc_nobreak', 'The program fails to compile', false, 30),
  ('cpp.control_flow.switch_statement.mc_nobreak.d', 'cpp.control_flow.switch_statement.mc_nobreak', 'It jumps to default', false, 40),
  ('cpp.control_flow.loop_invariants.mc_halfopen.a', 'cpp.control_flow.loop_invariants.mc_halfopen', '[0, n)', true, 10),
  ('cpp.control_flow.loop_invariants.mc_halfopen.b', 'cpp.control_flow.loop_invariants.mc_halfopen', '[0, n]', false, 20),
  ('cpp.control_flow.loop_invariants.mc_halfopen.c', 'cpp.control_flow.loop_invariants.mc_halfopen', '[1, n]', false, 30),
  ('cpp.control_flow.loop_invariants.mc_halfopen.d', 'cpp.control_flow.loop_invariants.mc_halfopen', '[1, n + 1)', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
