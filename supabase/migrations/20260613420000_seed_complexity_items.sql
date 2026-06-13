-- Learning content for the complexity and problem-solving skills (#68).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'dsa.complexity.big_o.lesson',
    'lesson',
    'Big-O notation',
    'Big-O describes how an algorithm''s running time grows as the input size `n` grows, ignoring constant factors and lower-order terms. Common classes from fastest to slowest: O(1) constant, O(log n) (binary search), O(n) (one scan), O(n log n) (efficient sorts), O(n^2) (nested loops over the data). For large inputs, only the dominant term matters.',
    'Count how the number of basic operations scales with n, then keep the biggest term. Constants and small terms are dropped.',
    'intermediate',
    4,
    1710
  ),
  (
    'dsa.complexity.big_o.mc_single_loop',
    'multiple_choice',
    'Complexity of one loop',
    'A single loop that does constant work for each of `n` elements has what time complexity?',
    'One pass over n elements with O(1) work per element is O(n). A loop nested inside another over the same data would be O(n^2).',
    'intermediate',
    2,
    1720
  ),
  (
    'dsa.complexity.problem_solving.lesson',
    'lesson',
    'A systematic solving process',
    'A reliable approach to a new problem: (1) understand the problem and its constraints; (2) work a small example by hand; (3) write a correct brute-force solution; (4) look for a better approach (sorting, hashing, two pointers, dynamic programming); (5) test edge cases (empty input, one element, duplicates, the maximum size). Optimize only after you have something correct.',
    'Correct-then-fast: a working brute force plus good tests beats a clever solution you cannot verify.',
    'intermediate',
    4,
    1730
  ),
  (
    'dsa.complexity.problem_solving.mc_first_step',
    'multiple_choice',
    'Before optimizing',
    'What is the best first step before trying to optimize a solution?',
    'Get a correct brute-force solution working and tested first. That gives a baseline and a reference to check any faster version against.',
    'intermediate',
    2,
    1740
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
  ('dsa.complexity.big_o.lesson', 'dsa.complexity.big_o', true),
  ('dsa.complexity.big_o.mc_single_loop', 'dsa.complexity.big_o', true),
  ('dsa.complexity.problem_solving.lesson', 'dsa.complexity.problem_solving', true),
  ('dsa.complexity.problem_solving.mc_first_step', 'dsa.complexity.problem_solving', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.complexity.big_o.mc_single_loop.a', 'dsa.complexity.big_o.mc_single_loop', 'O(n)', true, 10),
  ('dsa.complexity.big_o.mc_single_loop.b', 'dsa.complexity.big_o.mc_single_loop', 'O(1)', false, 20),
  ('dsa.complexity.big_o.mc_single_loop.c', 'dsa.complexity.big_o.mc_single_loop', 'O(n^2)', false, 30),
  ('dsa.complexity.big_o.mc_single_loop.d', 'dsa.complexity.big_o.mc_single_loop', 'O(log n)', false, 40),

  ('dsa.complexity.problem_solving.mc_first_step.a', 'dsa.complexity.problem_solving.mc_first_step', 'Write a correct brute-force solution and test it', true, 10),
  ('dsa.complexity.problem_solving.mc_first_step.b', 'dsa.complexity.problem_solving.mc_first_step', 'Pick the fastest known algorithm immediately', false, 20),
  ('dsa.complexity.problem_solving.mc_first_step.c', 'dsa.complexity.problem_solving.mc_first_step', 'Skip the examples and start coding', false, 30),
  ('dsa.complexity.problem_solving.mc_first_step.d', 'dsa.complexity.problem_solving.mc_first_step', 'Optimize memory usage first', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
