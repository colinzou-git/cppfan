-- Roadmap #68 / #110 (complexity follow-up): learning items for growth-rate
-- comparison, amortized analysis, and reading input constraints.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.complexity.growth_rates.lesson',
    'lesson',
    'Comparing growth rates',
    'Big-O describes how work grows with input size n, keeping only the dominant term and dropping constants: a loop doing 3n + 5 steps is O(n). The common rates, from slowest-growing to fastest, are O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n). To estimate, count how many times the innermost work runs: a single pass is O(n); a loop inside a loop over the same n is O(n^2); repeatedly halving the search space is O(log n); sorting then one pass is O(n log n). When you add phases you keep the biggest (O(n) + O(n log n) = O(n log n)); when you nest them you multiply. Big-Theta pins the growth from both sides; in everyday use we say Big-O but usually mean the tight bound.',
    'Drop constants and lower-order terms; rank O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n). Sequential phases keep the max; nested loops multiply.',
    'intermediate',
    5,
    2970,
    true
  ),
  (
    'dsa.complexity.growth_rates.mc_order',
    'multiple_choice',
    'Ordering complexities',
    'Which list orders these from slowest-growing to fastest-growing?',
    'From slowest to fastest growth: O(log n), O(n), O(n log n), O(n^2). Logarithmic grows slowest; the quadratic term dominates for large n.',
    'intermediate',
    2,
    2980,
    true
  ),
  (
    'dsa.complexity.amortized.lesson',
    'lesson',
    'Amortized analysis',
    'Amortized analysis asks for the average cost per operation across a whole sequence, not the worst single step. std::vector::push_back is the classic example: most pushes are O(1), but when the buffer is full the vector allocates a bigger block (typically doubling) and copies all existing elements — an O(n) step. Because capacity doubles, those expensive copies happen rarely and geometrically less often, and the total copying work across n pushes sums to O(n). Spread over n operations that is O(1) amortized per push. The lesson: an occasional costly step does not make the operation O(n) if its cost is paid down across many cheap steps. (Note this differs from average-case analysis over random inputs — amortized bounds hold for any sequence.)',
    'Amortized cost averages an operation over a sequence. vector::push_back doubles capacity, so rare O(n) resizes sum to O(n) total across n pushes — O(1) amortized each.',
    'advanced',
    5,
    2990,
    true
  ),
  (
    'dsa.complexity.amortized.mc_pushback',
    'multiple_choice',
    'Cost of push_back',
    'What is the amortized time complexity of a single std::vector::push_back?',
    'O(1) amortized: most pushes are constant time, and the occasional O(n) reallocation is rare enough (capacity doubles) that the total over n pushes is O(n).',
    'advanced',
    2,
    3000,
    true
  ),
  (
    'dsa.complexity.constraints.lesson',
    'lesson',
    'Reading input constraints',
    'Input bounds tell you which complexities are feasible before you write code. A rough rule for a ~1-second limit: n up to ~10^8 needs O(n); ~10^6 allows O(n log n); n up to a few thousand tolerates O(n^2); n up to ~20 may permit O(2^n) brute force. So if the problem says n can be 10^5, an O(n^2) plan (~10^10 operations) is almost certainly too slow and you should look for O(n log n) or better. Constraints also expose hidden costs: a loop that calls s.substr() or scans a string each iteration hides an extra O(n) factor, turning an apparent O(n) loop into O(n^2). Read the limits first, pick a target complexity, then design to it.',
    'Use n''s upper bound to pick a feasible target (n~1e8 -> O(n); ~1e6 -> O(n log n); ~1e3 -> O(n^2)); and watch for per-iteration work that hides an extra factor.',
    'intermediate',
    5,
    3010,
    true
  ),
  (
    'dsa.complexity.constraints.mc_feasible',
    'multiple_choice',
    'Using constraints',
    'If n can be up to 100,000 and the time limit is about one second, which approach is most likely too slow?',
    'An O(n^2) approach is ~10^10 operations at n = 100,000 — far beyond a one-second budget. O(n), O(n log n), and O(log n) all stay feasible.',
    'intermediate',
    2,
    3020,
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
  ('dsa.complexity.growth_rates.lesson', 'dsa.complexity.growth_rates', true),
  ('dsa.complexity.growth_rates.mc_order', 'dsa.complexity.growth_rates', true),
  ('dsa.complexity.amortized.lesson', 'dsa.complexity.amortized', true),
  ('dsa.complexity.amortized.mc_pushback', 'dsa.complexity.amortized', true),
  ('dsa.complexity.constraints.lesson', 'dsa.complexity.constraints', true),
  ('dsa.complexity.constraints.mc_feasible', 'dsa.complexity.constraints', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.complexity.growth_rates.mc_order.a', 'dsa.complexity.growth_rates.mc_order', 'O(log n), O(n), O(n log n), O(n^2)', true, 10),
  ('dsa.complexity.growth_rates.mc_order.b', 'dsa.complexity.growth_rates.mc_order', 'O(n), O(log n), O(n^2), O(n log n)', false, 20),
  ('dsa.complexity.growth_rates.mc_order.c', 'dsa.complexity.growth_rates.mc_order', 'O(n^2), O(n log n), O(n), O(log n)', false, 30),
  ('dsa.complexity.growth_rates.mc_order.d', 'dsa.complexity.growth_rates.mc_order', 'O(n log n), O(n), O(log n), O(n^2)', false, 40),
  ('dsa.complexity.amortized.mc_pushback.a', 'dsa.complexity.amortized.mc_pushback', 'O(1) amortized', true, 10),
  ('dsa.complexity.amortized.mc_pushback.b', 'dsa.complexity.amortized.mc_pushback', 'O(n) every time', false, 20),
  ('dsa.complexity.amortized.mc_pushback.c', 'dsa.complexity.amortized.mc_pushback', 'O(log n) amortized', false, 30),
  ('dsa.complexity.amortized.mc_pushback.d', 'dsa.complexity.amortized.mc_pushback', 'O(n log n) amortized', false, 40),
  ('dsa.complexity.constraints.mc_feasible.a', 'dsa.complexity.constraints.mc_feasible', 'An O(n^2) approach', true, 10),
  ('dsa.complexity.constraints.mc_feasible.b', 'dsa.complexity.constraints.mc_feasible', 'An O(n log n) approach', false, 20),
  ('dsa.complexity.constraints.mc_feasible.c', 'dsa.complexity.constraints.mc_feasible', 'An O(n) approach', false, 30),
  ('dsa.complexity.constraints.mc_feasible.d', 'dsa.complexity.constraints.mc_feasible', 'An O(log n) approach', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
