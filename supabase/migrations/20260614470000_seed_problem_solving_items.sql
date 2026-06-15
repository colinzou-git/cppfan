-- Roadmap #68 / #110 (problem-solving process): learning items for framing a
-- problem, boundary/adversarial examples, and brute-force-then-optimize.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.complexity.problem_framing.lesson',
    'lesson',
    'Framing a problem before coding',
    'Before writing any code, restate the problem precisely — most wrong solutions come from solving the wrong problem. Pin down the exact INPUTS (types, ranges, can they be empty, negative, or duplicated, are they sorted), the exact OUTPUT (one value or all of them, an index or the element, and what happens when there is no answer — return -1, throw, or empty), and the CONSTRAINTS (n up to 10^5 versus 10^9 hints at the target complexity). Then state the INVARIANTS the solution will maintain — a property true at every step, such as left and right always bracketing the answer in binary search, or the prefix up to index i already being sorted. Writing the invariant down turns a vague idea into something you can check each iteration against. Clarifying questions to ask, or assumptions to record: input size, value ranges, duplicates and ties, ordering, memory limits, and what counts as a valid answer when none exists. This framing prevents off-by-one and missing-case bugs and surfaces the constraint that points you at the right algorithm.',
    'Restate the problem before coding: exact inputs (types/ranges/empty/duplicates/sorted), exact output (one vs all, index vs value, what on no-answer), and constraints (the n bound hints at target complexity). State the invariant the solution maintains so you can check each step. Most wrong solutions solve the wrong problem.',
    'intermediate',
    5,
    4830,
    true
  ),
  (
    'dsa.complexity.problem_framing.mc_clarify',
    'multiple_choice',
    'The clarification that picks the algorithm',
    'A coding problem asks you to find a value. Before coding, which clarification most directly changes the algorithm you choose?',
    'The input-size constraint (how large n can be) sets the target complexity and thus the algorithm. Variable names, editor, and comments do not change the algorithm.',
    'intermediate',
    2,
    4840,
    true
  ),
  (
    'dsa.complexity.test_examples.lesson',
    'lesson',
    'Boundary and adversarial examples',
    'Concrete examples find bugs that staring at code does not. Before and while solving, build a small set of examples on purpose: a normal case, then the EDGE cases — empty input, a single element, all-equal elements, already-sorted and reverse-sorted, the smallest and largest allowed values, and duplicates or ties where order matters. Add ADVERSARIAL cases aimed at your specific approach: if you sort, try data that is already sorted or all-equal; if you use a sliding window, try a window that never shrinks; if you do arithmetic, try values that overflow a 32-bit int. Trace your idea by hand on each example before trusting it, and keep the examples as test cases afterward. Two payoffs: examples expose missing cases (the empty list, the single element, the no-answer case) early, and an adversarial example often reveals that a plausible greedy or shortcut is wrong — one counterexample is enough to discard it. They are cheap to make and catch the off-by-one and overflow bugs that survive a confident read-through.',
    'Build examples on purpose: a normal case plus edges (empty, single, all-equal, sorted, reverse-sorted, min/max values, duplicates/ties) and adversarial cases targeting your approach (already-sorted for a sort, overflow for arithmetic). They expose missing cases, and a single counterexample disproves a wrong greedy. Keep them as tests.',
    'intermediate',
    5,
    4850,
    true
  ),
  (
    'dsa.complexity.test_examples.mc_why',
    'multiple_choice',
    'Why build adversarial examples',
    'Why deliberately construct boundary and adversarial examples before trusting a solution?',
    'They surface missing edge cases (empty/single/duplicates/overflow) and a single adversarial counterexample can disprove a plausible-but-wrong greedy or shortcut — far cheaper than finding it in production. They check the algorithm; they do not replace choosing one.',
    'intermediate',
    2,
    4860,
    true
  ),
  (
    'dsa.complexity.bruteforce_then_optimize.lesson',
    'lesson',
    'Brute force first, then remove repeated work',
    'A reliable way to reach an efficient solution is to start with the obvious BRUTE FORCE — the simplest correct approach, even if it is O(n^2) or exponential — and get it right. The brute force does two jobs: it is a correctness reference you can test the fast version against, and reading it reveals the REPEATED WORK that optimization removes. Ask what the computation is redoing. Recomputing a sum over a sliding range points to a running total or prefix sums. Re-searching a collection points to sorting once or using a hash set for O(1) lookups. Re-solving the same subproblem points to memoization (top-down) or a table (bottom-up). Recomputing a min or max over a moving window points to a monotonic deque. The pattern is: identify the redundant recomputation, then introduce a data structure or precomputation that turns repeated O(k) work into O(1) or removes a whole loop. Argue correctness informally — state why each step preserves the invariant and why the loop terminates — rather than only trusting that the examples passed. Optimize only after the brute force is correct; a fast wrong answer is worse than a slow right one.',
    'Write the simplest correct brute force first — it is both a correctness oracle and a map of the repeated work to remove. Optimize by naming the redundant recomputation and replacing it (running total/prefix sums, hashing, sorting once, memoization/DP, monotonic deque). Argue correctness via the invariant and termination. Optimize only after correct.',
    'advanced',
    6,
    4870,
    true
  ),
  (
    'dsa.complexity.bruteforce_then_optimize.mc_step',
    'multiple_choice',
    'Making a brute force efficient',
    'After writing a correct but slow brute-force solution, what is the key step to make it efficient?',
    'Identify the repeated/redundant work the brute force does and eliminate it with a data structure or precomputation (prefix sums, hashing, memoization). Rewriting in a faster language or renaming variables does not remove the redundant work.',
    'advanced',
    2,
    4880,
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
  ('dsa.complexity.problem_framing.lesson', 'dsa.complexity.problem_framing', true),
  ('dsa.complexity.problem_framing.mc_clarify', 'dsa.complexity.problem_framing', true),
  ('dsa.complexity.test_examples.lesson', 'dsa.complexity.test_examples', true),
  ('dsa.complexity.test_examples.mc_why', 'dsa.complexity.test_examples', true),
  ('dsa.complexity.bruteforce_then_optimize.lesson', 'dsa.complexity.bruteforce_then_optimize', true),
  ('dsa.complexity.bruteforce_then_optimize.mc_step', 'dsa.complexity.bruteforce_then_optimize', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.complexity.problem_framing.mc_clarify.a', 'dsa.complexity.problem_framing.mc_clarify', 'The input-size constraint (how large n can be)', true, 10),
  ('dsa.complexity.problem_framing.mc_clarify.b', 'dsa.complexity.problem_framing.mc_clarify', 'What to name the variables', false, 20),
  ('dsa.complexity.problem_framing.mc_clarify.c', 'dsa.complexity.problem_framing.mc_clarify', 'Which text editor to use', false, 30),
  ('dsa.complexity.problem_framing.mc_clarify.d', 'dsa.complexity.problem_framing.mc_clarify', 'Whether to add comments', false, 40),
  ('dsa.complexity.test_examples.mc_why.a', 'dsa.complexity.test_examples.mc_why', 'They surface missing edge cases and can disprove a wrong approach with one counterexample', true, 10),
  ('dsa.complexity.test_examples.mc_why.b', 'dsa.complexity.test_examples.mc_why', 'They make the program run faster', false, 20),
  ('dsa.complexity.test_examples.mc_why.c', 'dsa.complexity.test_examples.mc_why', 'They replace the need to choose an algorithm', false, 30),
  ('dsa.complexity.test_examples.mc_why.d', 'dsa.complexity.test_examples.mc_why', 'They are only useful after the code is already correct', false, 40),
  ('dsa.complexity.bruteforce_then_optimize.mc_step.a', 'dsa.complexity.bruteforce_then_optimize.mc_step', 'Identify the repeated work and remove it with a data structure or precomputation', true, 10),
  ('dsa.complexity.bruteforce_then_optimize.mc_step.b', 'dsa.complexity.bruteforce_then_optimize.mc_step', 'Rewrite the same approach in a faster language', false, 20),
  ('dsa.complexity.bruteforce_then_optimize.mc_step.c', 'dsa.complexity.bruteforce_then_optimize.mc_step', 'Add more comments and rename variables', false, 30),
  ('dsa.complexity.bruteforce_then_optimize.mc_step.d', 'dsa.complexity.bruteforce_then_optimize.mc_step', 'Increase the recursion depth limit', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
