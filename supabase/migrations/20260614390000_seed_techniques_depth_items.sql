-- Roadmap #76 / #116 (algorithmic techniques depth): learning items for 2-D
-- prefix sums / difference arrays, interval scheduling, and DP forms +
-- reconstruction.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.techniques.prefix_2d.lesson',
    'lesson',
    '2-D prefix sums and difference arrays',
    'A 2-D prefix sum extends the 1-D idea to matrices. Build a table P where P[i][j] is the sum of the rectangle from (0,0) to (i-1,j-1); then the sum of any submatrix is found in O(1) by inclusion-exclusion: sum = P[r2][c2] - P[r1][c2] - P[r2][c1] + P[r1][c1]. Building P is O(rows*cols), after which each of many queries is O(1) — the win when you answer lots of rectangle-sum queries on a static grid. The mirror tool for many range UPDATES (add a value to every cell in a rectangle) is a difference array: record the change at the corners (+v at the top-left, -v just past the right and bottom edges, +v at the far corner), then take a 2-D prefix sum at the end to materialize the final grid in O(rows*cols) total instead of O(area) per update. Both rely on the same inclusion-exclusion arithmetic; the prefix table answers queries on a fixed array, the difference array batches updates before reading. For a static array with O(log n) point updates AND range queries you would instead reach for a Fenwick/segment tree (see range structures).',
    '2-D prefix sums give O(1) submatrix sums via inclusion-exclusion (P[r2][c2] - P[r1][c2] - P[r2][c1] + P[r1][c1]) after O(rows*cols) build — best for many queries on a static grid. A difference array batches rectangle range-updates by marking corners, then one prefix pass materializes the grid.',
    'advanced',
    6,
    4590,
    true
  ),
  (
    'dsa.techniques.prefix_2d.mc_query',
    'multiple_choice',
    'Submatrix sum from a 2-D prefix table',
    'With a 2-D prefix table P (P[i][j] = sum of the rectangle above-left of cell (i,j)), how do you get the sum of an arbitrary submatrix in O(1)?',
    'Inclusion-exclusion: take the big rectangle, subtract the two overhanging rectangles, then add back the top-left corner that was subtracted twice — P[r2][c2] - P[r1][c2] - P[r2][c1] + P[r1][c1].',
    'advanced',
    2,
    4600,
    true
  ),
  (
    'dsa.techniques.interval_scheduling.lesson',
    'lesson',
    'Interval scheduling and sorting as preprocessing',
    'The classic interval scheduling problem asks for the maximum number of mutually non-overlapping intervals you can choose. The greedy that works: sort the intervals by their RIGHT endpoint (finish time), then scan left to right, taking an interval whenever it starts at or after the last taken interval''s finish. Taking the earliest-finishing compatible interval leaves the most room for the rest, which an exchange argument proves optimal. A common wrong greedy is sorting by start time or by shortest length — both have simple counterexamples. This is one instance of a broader habit: sorting is preprocessing. Many problems become easy once the data is in the right order — sort by a key so a single linear scan, two pointers, or a greedy choice becomes correct (activity selection, merging intervals, minimizing waiting time, pairing elements). Decide what order makes the decision local, sort on that key (O(n log n)), then do the cheap pass. Watch the tie-breaking and whether endpoints are inclusive.',
    'Maximum non-overlapping intervals: sort by finish time, then greedily take each interval that starts at/after the last taken finish — earliest finish leaves the most room (exchange-argument optimal). Sorting by start or by length is wrong. More broadly, sort as preprocessing so a linear scan / two pointers / greedy becomes correct.',
    'advanced',
    6,
    4610,
    true
  ),
  (
    'dsa.techniques.interval_scheduling.mc_key',
    'multiple_choice',
    'Greedy key for interval scheduling',
    'To select the maximum number of mutually non-overlapping intervals, which sort key makes the greedy choice optimal?',
    'Sort by the right endpoint (earliest finish time). Taking the earliest-finishing compatible interval leaves the most room for later ones. Sorting by start time or by shortest duration has easy counterexamples.',
    'advanced',
    2,
    4620,
    true
  ),
  (
    'dsa.techniques.dp_forms.lesson',
    'lesson',
    'Common DP forms and reconstruction',
    'Most DPs you meet fit a small set of shapes; recognizing the shape tells you the state. 1-D / linear (e.g. house robber, climbing stairs): dp[i] from a few earlier indices. Grid (unique paths, min path sum, edit distance): dp[i][j] from neighboring cells. Knapsack / subset (0/1 knapsack, coin change, subset sum): dp indexed by item and remaining capacity. Subsequence (longest increasing subsequence, longest common subsequence): dp over prefixes/positions. After computing the optimum VALUE, you often need the actual choice — reconstruction. Two ways: keep a parent/choice pointer for each state and walk it back from the answer state, or re-derive the decision by checking which predecessor produced dp at each step, tracing from the end to the base case and reversing. Reconstruction usually costs no more than the DP itself and only a little extra memory for the back-pointers. Pick the form, write state/transition/base, then add the trace-back only once the value DP is correct.',
    'Common DP forms: 1-D/linear, grid, knapsack/subset (item x capacity), and subsequence (LIS/LCS over prefixes). Recognizing the form gives the state. To recover the chosen solution, store back-pointers (or re-derive the winning predecessor) and trace from the answer back to the base case, then reverse.',
    'advanced',
    6,
    4630,
    true
  ),
  (
    'dsa.techniques.dp_forms.mc_reconstruct',
    'multiple_choice',
    'Reconstructing a DP solution',
    'After a DP fills the table with optimal VALUES, how do you recover the actual choices that achieve the optimum?',
    'Trace back from the answer state to the base case, at each step following a stored parent/choice pointer (or re-deriving which predecessor produced the value), then reverse the collected choices. It costs about the same as the DP plus a little memory for back-pointers.',
    'advanced',
    2,
    4640,
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
  ('dsa.techniques.prefix_2d.lesson', 'dsa.techniques.prefix_2d', true),
  ('dsa.techniques.prefix_2d.mc_query', 'dsa.techniques.prefix_2d', true),
  ('dsa.techniques.interval_scheduling.lesson', 'dsa.techniques.interval_scheduling', true),
  ('dsa.techniques.interval_scheduling.mc_key', 'dsa.techniques.interval_scheduling', true),
  ('dsa.techniques.dp_forms.lesson', 'dsa.techniques.dp_forms', true),
  ('dsa.techniques.dp_forms.mc_reconstruct', 'dsa.techniques.dp_forms', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.techniques.prefix_2d.mc_query.a', 'dsa.techniques.prefix_2d.mc_query', 'P[r2][c2] - P[r1][c2] - P[r2][c1] + P[r1][c1]', true, 10),
  ('dsa.techniques.prefix_2d.mc_query.b', 'dsa.techniques.prefix_2d.mc_query', 'P[r2][c2] - P[r1][c1]', false, 20),
  ('dsa.techniques.prefix_2d.mc_query.c', 'dsa.techniques.prefix_2d.mc_query', 'P[r2][c2] - P[r1][c2] - P[r2][c1]', false, 30),
  ('dsa.techniques.prefix_2d.mc_query.d', 'dsa.techniques.prefix_2d.mc_query', 'P[r2][c2] + P[r1][c1]', false, 40),
  ('dsa.techniques.interval_scheduling.mc_key.a', 'dsa.techniques.interval_scheduling.mc_key', 'The right endpoint (earliest finish time)', true, 10),
  ('dsa.techniques.interval_scheduling.mc_key.b', 'dsa.techniques.interval_scheduling.mc_key', 'The left endpoint (earliest start time)', false, 20),
  ('dsa.techniques.interval_scheduling.mc_key.c', 'dsa.techniques.interval_scheduling.mc_key', 'Shortest duration first', false, 30),
  ('dsa.techniques.interval_scheduling.mc_key.d', 'dsa.techniques.interval_scheduling.mc_key', 'Fewest overlaps first', false, 40),
  ('dsa.techniques.dp_forms.mc_reconstruct.a', 'dsa.techniques.dp_forms.mc_reconstruct', 'Trace back from the answer via stored choice/parent pointers to the base case, then reverse', true, 10),
  ('dsa.techniques.dp_forms.mc_reconstruct.b', 'dsa.techniques.dp_forms.mc_reconstruct', 'Re-run the DP with every possible answer until one matches', false, 20),
  ('dsa.techniques.dp_forms.mc_reconstruct.c', 'dsa.techniques.dp_forms.mc_reconstruct', 'The optimal value already is the sequence of choices', false, 30),
  ('dsa.techniques.dp_forms.mc_reconstruct.d', 'dsa.techniques.dp_forms.mc_reconstruct', 'Sort the table and read off the largest entries', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
