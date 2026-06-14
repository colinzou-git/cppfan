-- Roadmap #76 / #116 (techniques depth): learning items for range-query
-- structures, greedy proofs, and DP design.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.techniques.range_structures.lesson',
    'lesson',
    'Range query structures',
    'Pick the range-query structure by whether the data changes. If the array is static (no updates between queries), a precomputed prefix-sum array answers range sums in O(1) after O(n) build — nothing beats it. If values update between queries, a prefix sum would need an O(n) rebuild each time, so use a Fenwick (binary indexed) tree: O(log n) point update and O(log n) prefix query, compact and simple, ideal for sums. For more general range operations (range min/max, range assignment, lazy range updates) use a segment tree: O(log n) per query/update with O(n) space, more flexible but more code. A sparse table is an enrichment for idempotent, immutable queries like range-min: O(n log n) build, O(1) query, but no updates. The decision rule: static -> prefix sum (or sparse table for min/max); dynamic -> Fenwick for sums, segment tree for general/lazy operations.',
    'Static data: prefix sums (O(1) query after O(n) build); sparse table for immutable range-min (O(1)). With updates: Fenwick tree for sums (O(log n) update/query), segment tree for general/lazy range ops.',
    'advanced',
    6,
    3810,
    true
  ),
  (
    'dsa.techniques.range_structures.mc_dynamic',
    'multiple_choice',
    'Choosing for dynamic range sums',
    'You need range-sum queries on an array whose values are frequently updated between queries. Which structure fits best?',
    'A Fenwick (binary indexed) tree gives O(log n) point updates and O(log n) prefix/range-sum queries. A plain prefix-sum array would need an O(n) rebuild after each update.',
    'advanced',
    2,
    3820,
    true
  ),
  (
    'dsa.techniques.greedy_proof.lesson',
    'lesson',
    'Greedy proofs and counterexamples',
    'A greedy algorithm is only correct if the locally optimal choice provably leads to a global optimum — so you must justify it, not just trust it. The standard tool is an exchange argument: assume an optimal solution differs from the greedy one, then show you can swap in the greedy choice without making the solution worse, proving greedy is at least as good. Classic wins: interval scheduling (pick the interval that finishes earliest to leave the most room) and Huffman coding, often after sorting the input to expose the greedy order. Equally important is recognizing when greedy fails: the 0/1 knapsack defeats "take the highest value-per-weight first," and "largest coin first" makes change incorrectly for coin systems like {1, 3, 4} (greedy gives 6 = 4+1+1 but 3+3 is better). When you cannot find an exchange argument and a small counterexample exists, switch to dynamic programming.',
    'Prove greedy with an exchange argument (swapping in the greedy choice never worsens an optimal solution); sorting often sets up the greedy order. If a small counterexample exists (0/1 knapsack, coins {1,3,4} for 6), use DP instead.',
    'advanced',
    6,
    3830,
    true
  ),
  (
    'dsa.techniques.greedy_proof.mc_exchange',
    'multiple_choice',
    'Justifying a greedy algorithm',
    'What is the standard way to prove a greedy choice yields a globally optimal solution?',
    'An exchange argument: assume an optimal solution and show you can swap in the greedy choice without making it worse, so greedy is at least as good. Testing a few inputs is not a proof.',
    'advanced',
    2,
    3840,
    true
  ),
  (
    'dsa.techniques.dp_design.lesson',
    'lesson',
    'Designing a DP',
    'Designing a DP is mostly about naming things precisely. Define the state (what a subproblem is, e.g. dp[i] = longest increasing subsequence ending at i), the transition (how a state is computed from smaller ones), the base case(s), and the evaluation order so every state dependencies are ready before it. With that, you can implement it two equivalent ways: top-down memoization writes the recurrence naturally and caches results (easy to derive, recursion overhead), or bottom-up tabulation fills a table in dependency order (no recursion, easy to space-optimize). Get correctness first; only then apply space optimization (e.g. keep just the previous row of a grid DP) — optimizing a wrong recurrence wastes effort. To recover the actual solution (not just its value), store choices or backtrack through the table. Classic forms to recognize: 1-D (Fibonacci, climbing stairs, LIS), grid DP, and knapsack.',
    'A DP = state + transition + base case + evaluation order. Implement via memoization (top-down) or tabulation (bottom-up). Establish correctness before space optimization; store choices to reconstruct the solution.',
    'advanced',
    6,
    3850,
    true
  ),
  (
    'dsa.techniques.dp_design.mc_order',
    'multiple_choice',
    'When to optimize DP space',
    'When should you apply space optimization (e.g. keeping only the previous row) to a DP?',
    'Only after the recurrence is correct. Space optimization rewrites a working DP to use less memory; doing it before correctness just makes a wrong solution harder to debug.',
    'advanced',
    2,
    3860,
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
  ('dsa.techniques.range_structures.lesson', 'dsa.techniques.range_structures', true),
  ('dsa.techniques.range_structures.mc_dynamic', 'dsa.techniques.range_structures', true),
  ('dsa.techniques.greedy_proof.lesson', 'dsa.techniques.greedy_proof', true),
  ('dsa.techniques.greedy_proof.mc_exchange', 'dsa.techniques.greedy_proof', true),
  ('dsa.techniques.dp_design.lesson', 'dsa.techniques.dp_design', true),
  ('dsa.techniques.dp_design.mc_order', 'dsa.techniques.dp_design', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.techniques.range_structures.mc_dynamic.a', 'dsa.techniques.range_structures.mc_dynamic', 'A Fenwick (binary indexed) tree', true, 10),
  ('dsa.techniques.range_structures.mc_dynamic.b', 'dsa.techniques.range_structures.mc_dynamic', 'A static prefix-sum array', false, 20),
  ('dsa.techniques.range_structures.mc_dynamic.c', 'dsa.techniques.range_structures.mc_dynamic', 'A sparse table', false, 30),
  ('dsa.techniques.range_structures.mc_dynamic.d', 'dsa.techniques.range_structures.mc_dynamic', 'A plain unsorted vector', false, 40),
  ('dsa.techniques.greedy_proof.mc_exchange.a', 'dsa.techniques.greedy_proof.mc_exchange', 'An exchange argument (swapping in the greedy choice never worsens an optimum)', true, 10),
  ('dsa.techniques.greedy_proof.mc_exchange.b', 'dsa.techniques.greedy_proof.mc_exchange', 'Running it on a few example inputs', false, 20),
  ('dsa.techniques.greedy_proof.mc_exchange.c', 'dsa.techniques.greedy_proof.mc_exchange', 'Measuring its runtime', false, 30),
  ('dsa.techniques.greedy_proof.mc_exchange.d', 'dsa.techniques.greedy_proof.mc_exchange', 'Checking that it compiles without warnings', false, 40),
  ('dsa.techniques.dp_design.mc_order.a', 'dsa.techniques.dp_design.mc_order', 'Only after the recurrence is correct', true, 10),
  ('dsa.techniques.dp_design.mc_order.b', 'dsa.techniques.dp_design.mc_order', 'First, before writing the transition', false, 20),
  ('dsa.techniques.dp_design.mc_order.c', 'dsa.techniques.dp_design.mc_order', 'Never; DP cannot be space-optimized', false, 30),
  ('dsa.techniques.dp_design.mc_order.d', 'dsa.techniques.dp_design.mc_order', 'Only when using recursion', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
