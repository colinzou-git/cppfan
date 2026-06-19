-- Roadmap #76 / #116 final techniques coverage: prefix/difference arrays,
-- range-query operations, greedy counterexamples, and DP design/forms.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.techniques.prefix_sums.code_diff_trace',
    'code_reading',
    'Trace a difference array',
    $prompt$An array of length 5 starts as all zeroes. You apply range additions on inclusive indexes: add 3 to [1, 3], then add 2 to [2, 4]. Using a 1-D difference array with +v at l and -v at r+1, what final array appears after the prefix pass?$prompt$,
    $explanation$The diff marks are diff[1]+=3, diff[4]-=3, diff[2]+=2, and the r+1 mark for [2,4] lands just past the array. Prefixing the diff gives final values [0, 3, 5, 5, 2]. Range updates are recorded in O(1) each, then one O(n) prefix pass materializes the array.$explanation$,
    'intermediate',
    3,
    2224,
    true
  ),
  (
    'dsa.techniques.prefix_sums.mc_prefix_suffix',
    'multiple_choice',
    'Prefix/suffix aggregate split',
    $prompt$You need, for every split point i, the sum of values before i and the maximum value after i in a static array. Which preprocessing best supports all split checks in O(n) total?$prompt$,
    $explanation$Build a prefix-sum array for the left side and a suffix-maximum array for the right side. Each split can then combine O(1) left and right aggregate values after O(n) preprocessing.$explanation$,
    'intermediate',
    2,
    2226,
    true
  ),
  (
    'dsa.techniques.range_structures.code_fenwick_trace',
    'code_reading',
    'Trace Fenwick updates and queries',
    $prompt$A Fenwick tree stores point updates and prefix sums. Start with values [2, 1, 3, 0] using 1-based indexes. After adding 4 to index 3, what is sum(1..3), and what is the asymptotic cost of the point update and prefix query?$prompt$,
    $explanation$Index 3 changes from 3 to 7, so sum(1..3) becomes 2 + 1 + 7 = 10. A Fenwick tree walks indexes by lowbit jumps, so both point update and prefix query cost O(log n), with O(n) space.$explanation$,
    'advanced',
    3,
    3824,
    true
  ),
  (
    'dsa.techniques.range_structures.mc_sparse_table',
    'multiple_choice',
    'When a sparse table fits',
    $prompt$You have an immutable array and need many range-minimum queries, with no updates after preprocessing. Which structure gives O(1) queries after preprocessing?$prompt$,
    $explanation$A sparse table fits immutable idempotent queries such as min/max/gcd: O(n log n) build and O(1) query. It does not support updates. Prefix sums only handle sums, and Fenwick/segment trees are better when updates exist.$explanation$,
    'advanced',
    2,
    3826,
    true
  ),
  (
    'dsa.techniques.range_structures.code_segment_trace',
    'code_reading',
    'Choose a segment tree operation',
    $prompt$You need range minimum queries while values can be assigned at individual indexes between queries. Why is a segment tree a better fit than a prefix-sum array here, and what are the point-update and range-query costs?$prompt$,
    $explanation$A prefix-sum array answers static sum queries, not dynamic range minima. A segment tree stores one aggregate per interval, so a point update refreshes O(log n) nodes and a range minimum query combines O(log n) interval nodes. Space is O(n).$explanation$,
    'advanced',
    3,
    3828,
    true
  ),
  (
    'dsa.techniques.greedy_proof.mc_counterexample',
    'multiple_choice',
    'Spot a failed greedy rule',
    $prompt$For 0/1 knapsack with capacity 10, items are A(value 60, weight 10), B(value 50, weight 6), and C(value 50, weight 4). Which result disproves the greedy rule 'take highest value first'?$prompt$,
    $explanation$Highest value first takes A for value 60 and fills the bag. But B+C fits exactly with value 100, so the greedy rule is not safe. A counterexample is enough to reject a greedy rule; then use DP for 0/1 knapsack.$explanation$,
    'advanced',
    2,
    3844,
    true
  ),
  (
    'dsa.techniques.dp_design.worked_climbing_stairs',
    'worked_example',
    'Worked example: design a 1-D DP',
    $prompt$Design a DP for counting ways to climb n stairs when each move is 1 or 2 steps.

Step 1 - state: dp[i] is the number of ways to reach stair i.

Step 2 - base cases: dp[0] = 1 (one empty way) and dp[1] = 1.

Step 3 - transition: the last move to i came from i-1 or i-2, so dp[i] = dp[i-1] + dp[i-2].

Step 4 - order: fill i from 2 up to n so both dependencies are already known.

The O(n) table can later be space-optimized to two variables because each state only needs the previous two values.$prompt$,
    $explanation$A complete DP design names state, transition, base cases, and evaluation order before optimizing space. Here dp[i] depends only on dp[i-1] and dp[i-2], so the simple table is correct first, then a two-variable version is safe.$explanation$,
    'intermediate',
    5,
    3864,
    true
  ),
  (
    'dsa.techniques.dp_design.code_memo_tab_trace',
    'code_reading',
    'Memoization vs tabulation dependencies',
    $prompt$A recurrence uses dp[i][j] from dp[i-1][j] and dp[i][j-1]. In bottom-up tabulation, which evaluation order is valid, and why would top-down memoization also work?$prompt$,
    $explanation$Fill rows from top to bottom and columns from left to right after setting the first row/column base cases; then dp[i-1][j] and dp[i][j-1] are ready before dp[i][j]. Top-down memoization also works because recursion computes dependencies on demand and caches each state once.$explanation$,
    'advanced',
    3,
    3866,
    true
  ),
  (
    'dsa.techniques.prefix_2d.code_difference_trace',
    'code_reading',
    'Trace a 2-D difference update',
    $prompt$In a 3x3 zero grid, add 5 to the rectangle with rows [0,1] and columns [1,2]. A 2-D difference array marks +5 at (0,1), -5 at (2,1), -5 at (0,3), and +5 at (2,3), then takes 2-D prefix sums. Which cells end as 5?$prompt$,
    $explanation$Only the rectangle rows 0..1 and columns 1..2 receives the update: (0,1), (0,2), (1,1), and (1,2) become 5. Corner marks batch the range update in O(1), and the final prefix pass materializes all cells in O(rows*cols).$explanation$,
    'advanced',
    3,
    4604,
    true
  ),
  (
    'dsa.techniques.interval_scheduling.code_trace',
    'code_reading',
    'Trace interval scheduling',
    $prompt$Intervals are [1,4], [2,3], [3,5], [0,6], and [5,7]. Sort by finish time and greedily take each interval whose start is at least the last selected finish. Which intervals are chosen?$prompt$,
    $explanation$Sorted by finish, the intervals are [2,3], [1,4], [3,5], [0,6], [5,7]. Take [2,3], skip [1,4], take [3,5], skip [0,6], and take [5,7]. The chosen set is [2,3], [3,5], [5,7].$explanation$,
    'advanced',
    3,
    4624,
    true
  ),
  (
    'dsa.techniques.dp_forms.code_knapsack_trace',
    'code_reading',
    'Trace a knapsack transition',
    $prompt$For 0/1 knapsack, dp[i][w] is the best value using the first i items and capacity w. Item i has value 7 and weight 3. If dp[i-1][5] = 8 and dp[i-1][2] = 4, what is dp[i][5] and which choice produced it?$prompt$,
    $explanation$Skip gives dp[i-1][5] = 8. Take gives value 7 + dp[i-1][2] = 11. The max is 11, produced by taking the item. The state is item prefix plus capacity; the transition compares skip vs take; base cases are zero items or zero capacity; evaluation fills increasing i and capacity.$explanation$,
    'advanced',
    3,
    4644,
    true
  ),
  (
    'dsa.techniques.dp_forms.code_subsequence_trace',
    'code_reading',
    'Trace a subsequence DP cell',
    $prompt$For LCS, the state dp[i][j] is the longest common subsequence length of the first i chars of A and first j chars of B. If A[i-1] == B[j-1], which transition fills dp[i][j], and what order makes dependencies available?$prompt$,
    $explanation$When the last characters match, dp[i][j] = 1 + dp[i-1][j-1]; otherwise it is max(dp[i-1][j], dp[i][j-1]). Base cases are dp[0][*] = dp[*][0] = 0. Filling i from 1..n and j from 1..m makes the diagonal, top, and left dependencies available.$explanation$,
    'advanced',
    3,
    4646,
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
  ('dsa.techniques.prefix_sums.code_diff_trace', 'dsa.techniques.prefix_sums', true),
  ('dsa.techniques.prefix_sums.mc_prefix_suffix', 'dsa.techniques.prefix_sums', true),
  ('dsa.techniques.range_structures.code_fenwick_trace', 'dsa.techniques.range_structures', true),
  ('dsa.techniques.range_structures.mc_sparse_table', 'dsa.techniques.range_structures', true),
  ('dsa.techniques.range_structures.code_segment_trace', 'dsa.techniques.range_structures', true),
  ('dsa.techniques.greedy_proof.mc_counterexample', 'dsa.techniques.greedy_proof', true),
  ('dsa.techniques.dp_design.worked_climbing_stairs', 'dsa.techniques.dp_design', true),
  ('dsa.techniques.dp_design.code_memo_tab_trace', 'dsa.techniques.dp_design', true),
  ('dsa.techniques.prefix_2d.code_difference_trace', 'dsa.techniques.prefix_2d', true),
  ('dsa.techniques.interval_scheduling.code_trace', 'dsa.techniques.interval_scheduling', true),
  ('dsa.techniques.dp_forms.code_knapsack_trace', 'dsa.techniques.dp_forms', true),
  ('dsa.techniques.dp_forms.code_subsequence_trace', 'dsa.techniques.dp_forms', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.techniques.prefix_sums.mc_prefix_suffix.a', 'dsa.techniques.prefix_sums.mc_prefix_suffix', 'Build prefix sums for the left side and suffix maxima for the right side', true, 10),
  ('dsa.techniques.prefix_sums.mc_prefix_suffix.b', 'dsa.techniques.prefix_sums.mc_prefix_suffix', 'Sort the array first, then use the sorted indexes as split points', false, 20),
  ('dsa.techniques.prefix_sums.mc_prefix_suffix.c', 'dsa.techniques.prefix_sums.mc_prefix_suffix', 'Use a queue and rescan the suffix for every split', false, 30),
  ('dsa.techniques.prefix_sums.mc_prefix_suffix.d', 'dsa.techniques.prefix_sums.mc_prefix_suffix', 'Use Dijkstra because each split has two directions', false, 40),
  ('dsa.techniques.range_structures.mc_sparse_table.a', 'dsa.techniques.range_structures.mc_sparse_table', 'A sparse table for immutable idempotent queries', true, 10),
  ('dsa.techniques.range_structures.mc_sparse_table.b', 'dsa.techniques.range_structures.mc_sparse_table', 'A prefix-sum array, because minimum is just another sum', false, 20),
  ('dsa.techniques.range_structures.mc_sparse_table.c', 'dsa.techniques.range_structures.mc_sparse_table', 'A queue, because range minima are FIFO', false, 30),
  ('dsa.techniques.range_structures.mc_sparse_table.d', 'dsa.techniques.range_structures.mc_sparse_table', 'A Fenwick tree with O(1) range-min updates', false, 40),
  ('dsa.techniques.greedy_proof.mc_counterexample.a', 'dsa.techniques.greedy_proof.mc_counterexample', 'Greedy takes A for value 60, but B+C fits with value 100', true, 10),
  ('dsa.techniques.greedy_proof.mc_counterexample.b', 'dsa.techniques.greedy_proof.mc_counterexample', 'Greedy takes B+C and gets the same value as A', false, 20),
  ('dsa.techniques.greedy_proof.mc_counterexample.c', 'dsa.techniques.greedy_proof.mc_counterexample', 'A counterexample is impossible if the highest-value item fits', false, 30),
  ('dsa.techniques.greedy_proof.mc_counterexample.d', 'dsa.techniques.greedy_proof.mc_counterexample', 'Sorting by weight proves highest-value-first is optimal', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
