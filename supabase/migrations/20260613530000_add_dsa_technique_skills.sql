-- Roadmap #65 / #76 (stage 9): prefix sums, sliding window, greedy, dynamic programming.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.techniques.prefix_sums',
    'dsa',
    'dsa.techniques',
    'Prefix sums',
    'Precompute cumulative sums to answer range-sum queries in O(1).',
    'Build a prefix-sum array and use it to answer subarray-sum queries fast.',
    'intermediate',
    array['lesson', 'quiz'],
    1810
  ),
  (
    'dsa.techniques.sliding_window',
    'dsa',
    'dsa.techniques',
    'Sliding window',
    'Maintain a moving window over a sequence to scan subarrays in O(n).',
    'Use a sliding window for fixed- or variable-length subarray problems.',
    'intermediate',
    array['lesson', 'quiz'],
    1820
  ),
  (
    'dsa.techniques.greedy',
    'dsa',
    'dsa.techniques',
    'Greedy algorithms',
    'Make the locally optimal choice at each step when it yields a global optimum.',
    'Recognize when a greedy choice is provably optimal versus when it fails.',
    'advanced',
    array['lesson', 'quiz'],
    1830
  ),
  (
    'dsa.techniques.dynamic_programming',
    'dsa',
    'dsa.techniques',
    'Dynamic programming',
    'Solve overlapping subproblems once and reuse results via memoization or tabulation.',
    'Identify optimal substructure and overlapping subproblems and write a DP recurrence.',
    'advanced',
    array['lesson', 'quiz'],
    1840
  )
on conflict (id) do update
set
  domain = excluded.domain,
  module_id = excluded.module_id,
  title = excluded.title,
  description = excluded.description,
  learner_goal = excluded.learner_goal,
  level = excluded.level,
  item_types = excluded.item_types,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.skill_prerequisites (skill_id, prerequisite_skill_id, relationship_type)
values
  ('dsa.techniques.prefix_sums', 'dsa.arrays.traversal', 'recommended'),
  ('dsa.techniques.sliding_window', 'dsa.arrays.two_pointers', 'recommended'),
  ('dsa.techniques.greedy', 'dsa.sorting.comparator', 'recommended'),
  ('dsa.techniques.dynamic_programming', 'dsa.recursion.base_case', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
