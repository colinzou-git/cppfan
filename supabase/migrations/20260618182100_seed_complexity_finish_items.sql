-- Roadmap #68 / #110 finishing slice: hidden loop costs, time/space
-- tradeoffs, and invariant-based correctness reasoning.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.complexity.constraints.mc_hidden_cost',
    'multiple_choice',
    'Finding hidden nested cost',
    'A solution loops over every start index `i` in a string of length n and calls `s.substr(i)` inside the loop. What cost should you suspect before accepting the solution as O(n)?',
    '`substr(i)` copies a suffix whose length can be O(n), so doing it for every i hides a second factor and can make the solution O(n^2). Count the work done inside each loop, not just the loop headers.',
    'intermediate',
    2,
    3030,
    true
  ),
  (
    'dsa.complexity.time_space_tradeoffs.lesson',
    'lesson',
    'Time and space tradeoffs',
    'Many faster algorithms spend extra memory to avoid repeated work. A prefix-sum array stores n + 1 partial totals so each range-sum query becomes O(1) instead of rescanning O(k) elements. A frequency map stores counts so membership or duplicate checks are average O(1) instead of O(n) scans. A memo table stores solved subproblems so recursion does not recompute the same state. The tradeoff question is: does the saved time justify the extra space, and do the memory limits allow it? If n is 100,000, an O(n) helper array is usually fine; an O(n^2) table may be impossible. State both complexities when comparing approaches: brute force might be O(nq) time and O(1) extra space, while prefix sums are O(n + q) time and O(n) extra space.',
    'Extra memory can buy speed: prefix sums, frequency maps, and memo tables replace repeated scans or subproblems. Compare both time and space, and reject approaches whose helper storage exceeds the memory limit.',
    'intermediate',
    5,
    3040,
    true
  ),
  (
    'dsa.complexity.time_space_tradeoffs.mc_prefix',
    'multiple_choice',
    'Choosing a prefix-sum tradeoff',
    'You need to answer many range-sum queries on a static array. Which comparison best explains using prefix sums?',
    'Prefix sums spend O(n) extra space and O(n) preprocessing so each query is O(1), improving many queries from repeated O(k) scans to O(n + q) total time.',
    'intermediate',
    2,
    3050,
    true
  ),
  (
    'dsa.complexity.correctness_reasoning.lesson',
    'lesson',
    'Informal correctness reasoning',
    'A correctness argument is a short explanation of why the algorithm must return the right answer, not a formal proof ceremony. For a loop, name the INVARIANT: what is true before the first iteration and after every iteration. Then show progress: each step preserves the invariant while moving closer to done. Finally, explain termination: when the loop ends, the invariant plus the stop condition imply the answer is complete. For example, in a prefix-sum build, the invariant can be `prefix[i]` equals the sum of the first i elements. Each iteration appends one more element''s contribution, and when i reaches n, every prefix value is correct. For greedy algorithms, the argument often says why the local choice never blocks an optimal solution; for binary search, it says the answer always remains inside the current search range.',
    'Argue correctness by naming the invariant, showing each step preserves it and makes progress, then connecting the termination condition to the desired result. Examples help, but the invariant explains why all valid inputs work.',
    'advanced',
    5,
    4890,
    true
  ),
  (
    'dsa.complexity.correctness_reasoning.mc_invariant',
    'multiple_choice',
    'What an invariant does',
    'In an informal correctness argument for a loop-based algorithm, what should the invariant establish?',
    'An invariant is a statement that is true before the loop and remains true after each iteration. Combined with the loop''s termination condition, it explains why the final result is correct.',
    'advanced',
    2,
    4900,
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
  ('dsa.complexity.constraints.mc_hidden_cost', 'dsa.complexity.constraints', true),
  ('dsa.complexity.time_space_tradeoffs.lesson', 'dsa.complexity.time_space_tradeoffs', true),
  ('dsa.complexity.time_space_tradeoffs.mc_prefix', 'dsa.complexity.time_space_tradeoffs', true),
  ('dsa.complexity.correctness_reasoning.lesson', 'dsa.complexity.correctness_reasoning', true),
  ('dsa.complexity.correctness_reasoning.mc_invariant', 'dsa.complexity.correctness_reasoning', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.complexity.constraints.mc_hidden_cost.a', 'dsa.complexity.constraints.mc_hidden_cost', 'O(n^2), because each substr can copy O(n) characters', true, 10),
  ('dsa.complexity.constraints.mc_hidden_cost.b', 'dsa.complexity.constraints.mc_hidden_cost', 'O(n), because there is only one visible loop', false, 20),
  ('dsa.complexity.constraints.mc_hidden_cost.c', 'dsa.complexity.constraints.mc_hidden_cost', 'O(log n), because suffixes get shorter', false, 30),
  ('dsa.complexity.constraints.mc_hidden_cost.d', 'dsa.complexity.constraints.mc_hidden_cost', 'O(1), because substr is just a view', false, 40),
  ('dsa.complexity.time_space_tradeoffs.mc_prefix.a', 'dsa.complexity.time_space_tradeoffs.mc_prefix', 'Spend O(n) extra space and preprocessing so each query is O(1)', true, 10),
  ('dsa.complexity.time_space_tradeoffs.mc_prefix.b', 'dsa.complexity.time_space_tradeoffs.mc_prefix', 'Use no extra space and make each query O(1)', false, 20),
  ('dsa.complexity.time_space_tradeoffs.mc_prefix.c', 'dsa.complexity.time_space_tradeoffs.mc_prefix', 'Spend O(n^2) space so each query scans the whole array', false, 30),
  ('dsa.complexity.time_space_tradeoffs.mc_prefix.d', 'dsa.complexity.time_space_tradeoffs.mc_prefix', 'Sort the array first so original ranges are preserved', false, 40),
  ('dsa.complexity.correctness_reasoning.mc_invariant.a', 'dsa.complexity.correctness_reasoning.mc_invariant', 'A fact that is true before the loop and preserved after every iteration', true, 10),
  ('dsa.complexity.correctness_reasoning.mc_invariant.b', 'dsa.complexity.correctness_reasoning.mc_invariant', 'A benchmark showing the implementation is fast enough', false, 20),
  ('dsa.complexity.correctness_reasoning.mc_invariant.c', 'dsa.complexity.correctness_reasoning.mc_invariant', 'A sample input that happens to pass', false, 30),
  ('dsa.complexity.correctness_reasoning.mc_invariant.d', 'dsa.complexity.correctness_reasoning.mc_invariant', 'A variable name chosen before coding', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
