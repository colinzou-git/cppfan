-- Learning content for the DSA stacks/queues and hashing skills (#48).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'dsa.stacks.basic_stack.lesson',
    'lesson',
    'When to use a stack or a queue',
    'A stack (LIFO) fits problems with nested or reversible structure: matching brackets, undo, depth-first search, and expression evaluation — push when you enter something, pop when you resolve it. A queue (FIFO) fits processing in arrival order and breadth-first search, where you handle items level by level. Choosing the structure that matches the order of work usually makes the algorithm simple.',
    'Ask: do I resolve the most recent thing first (stack) or the oldest thing first (queue)? The answer picks the structure.',
    'intermediate',
    4,
    1510
  ),
  (
    'dsa.stacks.basic_stack.mc_parens',
    'multiple_choice',
    'Checking balanced brackets',
    'Which data structure most naturally checks whether brackets like `(()())` are balanced?',
    'A stack matches nested structure: push each opening bracket and pop when a closing bracket matches the top. A leftover or mismatched bracket means it is unbalanced.',
    'intermediate',
    2,
    1520
  ),
  (
    'dsa.hashing.lookup.lesson',
    'lesson',
    'Hashing for fast lookup',
    'A hash map (`std::unordered_map`) gives average O(1) lookup by key, and a hash set (`std::unordered_set`) gives average O(1) membership tests. Common patterns: count how often values appear, detect duplicates, or check "have I seen this before?" in a single pass. You trade extra memory for speed compared with repeatedly scanning a list.',
    'When a brute-force solution does repeated linear searches, a hash set/map often turns an O(n^2) scan into O(n).',
    'intermediate',
    4,
    1530
  ),
  (
    'dsa.hashing.lookup.mc_advantage',
    'multiple_choice',
    'Why hashing for lookups',
    'What is the main advantage of `std::unordered_set` over scanning a `std::vector` to test membership?',
    'A hash set tests membership in average O(1), versus O(n) for scanning a vector. That speedup is the reason to use hashing for lookups and duplicate detection.',
    'intermediate',
    2,
    1540
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
  ('dsa.stacks.basic_stack.lesson', 'dsa.stacks.basic_stack', true),
  ('dsa.stacks.basic_stack.mc_parens', 'dsa.stacks.basic_stack', true),
  ('dsa.hashing.lookup.lesson', 'dsa.hashing.lookup', true),
  ('dsa.hashing.lookup.mc_advantage', 'dsa.hashing.lookup', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.stacks.basic_stack.mc_parens.a', 'dsa.stacks.basic_stack.mc_parens', 'A stack', true, 10),
  ('dsa.stacks.basic_stack.mc_parens.b', 'dsa.stacks.basic_stack.mc_parens', 'A queue', false, 20),
  ('dsa.stacks.basic_stack.mc_parens.c', 'dsa.stacks.basic_stack.mc_parens', 'A priority_queue', false, 30),
  ('dsa.stacks.basic_stack.mc_parens.d', 'dsa.stacks.basic_stack.mc_parens', 'A sorted vector', false, 40),

  ('dsa.hashing.lookup.mc_advantage.a', 'dsa.hashing.lookup.mc_advantage', 'Average O(1) membership instead of O(n) scanning', true, 10),
  ('dsa.hashing.lookup.mc_advantage.b', 'dsa.hashing.lookup.mc_advantage', 'It keeps the elements sorted', false, 20),
  ('dsa.hashing.lookup.mc_advantage.c', 'dsa.hashing.lookup.mc_advantage', 'It always uses less memory', false, 30),
  ('dsa.hashing.lookup.mc_advantage.d', 'dsa.hashing.lookup.mc_advantage', 'It allows duplicate keys', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
