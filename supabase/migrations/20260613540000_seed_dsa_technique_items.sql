-- Roadmap #65 / #76 (stage 9): learning items for prefix sums, sliding window, greedy, DP.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.techniques.prefix_sums.lesson',
    'lesson',
    'Prefix sums',
    'A prefix-sum array stores the running total of a sequence: prefix[i] is the sum of the first i elements, with prefix[0] = 0. Building it takes one O(n) pass. Once built, the sum of any subarray from index l to r (inclusive) is prefix[r + 1] - prefix[l] in O(1) — no re-scanning. This turns many repeated range-sum queries from O(n) each into O(1) each after O(n) preprocessing. The same idea extends to 2D grids and to difference arrays for range updates.',
    'Precomputing cumulative sums lets each range-sum query be answered as a subtraction of two prefix values in O(1), after an O(n) build.',
    'intermediate',
    5,
    2210,
    true
  ),
  (
    'dsa.techniques.prefix_sums.mc_query',
    'multiple_choice',
    'Range-sum query cost',
    'After building a prefix-sum array, what is the cost of answering one subarray-sum query?',
    'The subarray sum equals prefix[r + 1] - prefix[l], a single subtraction, so each query is O(1) once the prefix array is built.',
    'intermediate',
    2,
    2220,
    true
  ),
  (
    'dsa.techniques.sliding_window.lesson',
    'lesson',
    'Sliding window',
    'A sliding window keeps two indices that bound a contiguous range of a sequence. As the right edge advances to include new elements, the left edge advances to drop elements that violate a constraint (a fixed length, a sum limit, or a uniqueness rule). Because each element enters and leaves the window at most once, the whole scan is O(n) instead of the O(n^2) you would get from re-examining every subarray. It is the go-to pattern for "longest/shortest subarray that satisfies X" problems.',
    'A sliding window advances two pointers so each element is added and removed at most once, scanning all relevant subarrays in O(n).',
    'intermediate',
    5,
    2230,
    true
  ),
  (
    'dsa.techniques.sliding_window.mc_complexity',
    'multiple_choice',
    'Why the window is fast',
    'What makes the sliding-window technique run in O(n) rather than O(n^2)?',
    'Each element is added to the window once (when the right pointer passes it) and removed at most once (when the left pointer passes it), so total work is linear.',
    'intermediate',
    2,
    2240,
    true
  ),
  (
    'dsa.techniques.greedy.lesson',
    'lesson',
    'Greedy algorithms',
    'A greedy algorithm builds a solution by always taking the choice that looks best right now, never reconsidering. It is fast and simple, but only correct when the problem has the greedy-choice property — a locally optimal choice leads to a globally optimal solution — usually backed by an exchange argument. Activity selection (always pick the next-finishing compatible interval) and Huffman coding are classic greedy wins. But for problems like the 0/1 knapsack, greedy fails and you need dynamic programming. Always justify why the greedy choice is safe before trusting it.',
    'Greedy takes the best immediate choice and never backtracks; it is correct only when a locally optimal choice provably leads to a global optimum.',
    'advanced',
    5,
    2250,
    true
  ),
  (
    'dsa.techniques.greedy.mc_fails',
    'multiple_choice',
    'When greedy is wrong',
    'For which problem does a greedy strategy generally fail to give the optimal answer?',
    'The 0/1 knapsack (each item taken whole or not at all) is not solved optimally by greedy; it needs dynamic programming. The fractional knapsack, by contrast, is solvable greedily.',
    'advanced',
    2,
    2260,
    true
  ),
  (
    'dsa.techniques.dynamic_programming.lesson',
    'lesson',
    'Dynamic programming',
    'Dynamic programming solves a problem by combining solutions to overlapping subproblems, computing each subproblem once and reusing the result. It applies when a problem has optimal substructure (an optimal solution is built from optimal solutions to subproblems) and overlapping subproblems (the same subproblem recurs). Two styles: top-down memoization caches recursive results; bottom-up tabulation fills a table in dependency order. For example, naive Fibonacci is exponential, but memoizing it makes it O(n). Many DP problems then optimize space by keeping only the rows the recurrence depends on.',
    'DP applies when there is optimal substructure and overlapping subproblems; caching each subproblem once (memoization or tabulation) avoids exponential recomputation.',
    'advanced',
    6,
    2270,
    true
  ),
  (
    'dsa.techniques.dynamic_programming.mc_when',
    'multiple_choice',
    'When DP applies',
    'Which pair of properties signals that dynamic programming is the right approach?',
    'DP is the right tool when a problem has both optimal substructure (optimal solutions built from optimal subproblem solutions) and overlapping subproblems (the same subproblems recur and can be cached).',
    'advanced',
    2,
    2280,
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
  ('dsa.techniques.prefix_sums.lesson', 'dsa.techniques.prefix_sums', true),
  ('dsa.techniques.prefix_sums.mc_query', 'dsa.techniques.prefix_sums', true),
  ('dsa.techniques.sliding_window.lesson', 'dsa.techniques.sliding_window', true),
  ('dsa.techniques.sliding_window.mc_complexity', 'dsa.techniques.sliding_window', true),
  ('dsa.techniques.greedy.lesson', 'dsa.techniques.greedy', true),
  ('dsa.techniques.greedy.mc_fails', 'dsa.techniques.greedy', true),
  ('dsa.techniques.dynamic_programming.lesson', 'dsa.techniques.dynamic_programming', true),
  ('dsa.techniques.dynamic_programming.mc_when', 'dsa.techniques.dynamic_programming', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.techniques.prefix_sums.mc_query.a', 'dsa.techniques.prefix_sums.mc_query', 'O(1)', true, 10),
  ('dsa.techniques.prefix_sums.mc_query.b', 'dsa.techniques.prefix_sums.mc_query', 'O(log n)', false, 20),
  ('dsa.techniques.prefix_sums.mc_query.c', 'dsa.techniques.prefix_sums.mc_query', 'O(n)', false, 30),
  ('dsa.techniques.prefix_sums.mc_query.d', 'dsa.techniques.prefix_sums.mc_query', 'O(n^2)', false, 40),
  ('dsa.techniques.sliding_window.mc_complexity.a', 'dsa.techniques.sliding_window.mc_complexity', 'Each element enters and leaves the window at most once', true, 10),
  ('dsa.techniques.sliding_window.mc_complexity.b', 'dsa.techniques.sliding_window.mc_complexity', 'It sorts the array first', false, 20),
  ('dsa.techniques.sliding_window.mc_complexity.c', 'dsa.techniques.sliding_window.mc_complexity', 'It uses recursion to skip elements', false, 30),
  ('dsa.techniques.sliding_window.mc_complexity.d', 'dsa.techniques.sliding_window.mc_complexity', 'It examines every subarray explicitly', false, 40),
  ('dsa.techniques.greedy.mc_fails.a', 'dsa.techniques.greedy.mc_fails', 'The 0/1 knapsack problem', true, 10),
  ('dsa.techniques.greedy.mc_fails.b', 'dsa.techniques.greedy.mc_fails', 'Activity selection by earliest finish time', false, 20),
  ('dsa.techniques.greedy.mc_fails.c', 'dsa.techniques.greedy.mc_fails', 'The fractional knapsack problem', false, 30),
  ('dsa.techniques.greedy.mc_fails.d', 'dsa.techniques.greedy.mc_fails', 'Huffman coding', false, 40),
  ('dsa.techniques.dynamic_programming.mc_when.a', 'dsa.techniques.dynamic_programming.mc_when', 'Optimal substructure and overlapping subproblems', true, 10),
  ('dsa.techniques.dynamic_programming.mc_when.b', 'dsa.techniques.dynamic_programming.mc_when', 'Sorted input and a single answer', false, 20),
  ('dsa.techniques.dynamic_programming.mc_when.c', 'dsa.techniques.dynamic_programming.mc_when', 'No recursion and constant memory', false, 30),
  ('dsa.techniques.dynamic_programming.mc_when.d', 'dsa.techniques.dynamic_programming.mc_when', 'A greedy choice that is always safe', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
