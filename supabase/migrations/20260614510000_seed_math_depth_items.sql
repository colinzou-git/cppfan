-- Roadmap #83 / #122 (math depth): learning items for the fundamental counting
-- principle, generating combinations/subsets, and the convex hull.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.math.counting_principle.lesson',
    'lesson',
    'The fundamental counting principle',
    'The fundamental counting principle decomposes a count into independent stages. RULE OF PRODUCT: if a process is a sequence of independent choices with a ways for the first, b for the second, and so on, the total number of outcomes is a * b * ... — multiply. For example, a 4-character code of one letter then three digits has 26 * 10 * 10 * 10 outcomes. RULE OF SUM: if the outcomes split into disjoint (mutually exclusive) cases with a in the first and b in the second, the total is a + b — add. For example, a meal that is EITHER one of 3 soups OR one of 5 salads has 3 + 5 choices. The trap is mixing them: multiply only when the choices are made together and are independent; add only when the cases cannot both happen. Many counting questions reduce to drawing the decision as stages (multiply along a stage) and branches (add across disjoint branches). Watch for overcounting when choices are not truly independent — when order does not matter or items repeat — which is exactly where permutations, combinations, and inclusion-exclusion refine the raw product.',
    'Rule of product: independent sequential choices multiply (a * b * ...). Rule of sum: disjoint mutually-exclusive cases add (a + b). Multiply choices made together and independently; add cases that cannot co-occur. Overcounting (order, repeats, overlap) is where permutations/combinations/inclusion-exclusion refine the raw product.',
    'intermediate',
    5,
    4950,
    true
  ),
  (
    'dsa.math.counting_principle.mc_meal',
    'multiple_choice',
    'Product rule vs sum rule',
    'You pick one appetizer from 4 AND one main from 6 to form a two-course meal. How many distinct meals, and which rule applies?',
    '24, by the rule of product (4 * 6): the two choices are made together and independently, so multiply. The rule of sum (adding) applies only to disjoint either/or cases.',
    'intermediate',
    2,
    4960,
    true
  ),
  (
    'dsa.math.generate_combinations.lesson',
    'lesson',
    'Generating combinations and subsets',
    'Counting how many combinations exist is different from GENERATING them. To list every k-element combination (or every subset) of a set, use recursion/backtracking with a start index so you never reuse earlier elements or produce the same set in two orders. The shape: a recursive function takes the current start index and a partial selection; if the selection has the target size, record it; otherwise loop i from start to n-1, choose element i (append it), recurse with start = i + 1, then UNDO the choice (pop it) before trying the next i. Advancing start, rather than starting from 0 each time, is what makes each combination appear once in increasing order — the source of uniqueness. For ALL subsets (the power set) the same idea works with either a choose/skip recursion at each index, or by iterating bitmasks 0..2^n - 1 where bit j means include element j. Complexity is output-bound: there are C(n,k) combinations and 2^n subsets, so generation is inherently exponential in the worst case — only enumerate when n is small. The choose/recurse/undo skeleton here is exactly backtracking; permutations use the same skeleton but mark used elements instead of advancing a start index.',
    'Generating combinations (vs counting them) is backtracking: recurse with a start index, choose element i, recurse from i+1, then undo — advancing start makes each combination unique and ordered. All subsets = choose/skip recursion or bitmask 0..2^n-1. Output-bound and exponential (C(n,k) / 2^n), so only for small n. Same choose/recurse/undo skeleton as backtracking.',
    'advanced',
    6,
    4970,
    true
  ),
  (
    'dsa.math.generate_combinations.mc_unique',
    'multiple_choice',
    'Why combinations appear once',
    'When generating all k-combinations of a set by recursion, what makes each combination appear exactly once (no duplicates or reorderings)?',
    'Recursing from an advancing start index (each deeper call begins at i + 1) means earlier elements are never revisited, so each combination is produced once in increasing order. Without it you would generate permutations and duplicate sets.',
    'advanced',
    2,
    4980,
    true
  ),
  (
    'dsa.math.convex_hull.lesson',
    'lesson',
    'Convex hull (monotone chain)',
    'The convex hull of a set of points is the smallest convex polygon containing them all — picture a rubber band snapping around the outermost points. A clean O(n log n) construction is the monotone chain method: sort the points by x (then y), then sweep left to right building the LOWER hull and right to left building the UPPER hull. While adding a point to a hull, pop the previous point as long as the last three points do not make the required turn — tested with the cross product of the two edge vectors (the orientation/turn test from vectors and cross products). A cross product of zero means the points are collinear; decide up front whether to keep or drop collinear boundary points. Concatenate the two chains (dropping the duplicated endpoints) to get the hull in order. The sort dominates at O(n log n); the two sweeps are linear because each point is pushed and popped at most once. Convex hull underlies problems like the farthest pair of points, smallest enclosing shapes, and as a preprocessing step that discards interior points. The cross-product turn test is the same primitive used for segment intersection and polygon orientation.',
    'Convex hull = smallest convex polygon enclosing all points. Monotone chain: sort by x then build lower and upper chains, popping while the last three points do not turn the required way (cross-product orientation test); collinear (cross = 0) handled by policy. O(n log n) from the sort; linear sweeps (each point pushed/popped once). Reuses the cross-product turn test from segment intersection.',
    'advanced',
    6,
    4990,
    true
  ),
  (
    'dsa.math.convex_hull.mc_primitive',
    'multiple_choice',
    'The turn test in a convex hull',
    'In the monotone-chain convex hull, what primitive decides whether to pop the previous point while extending a chain?',
    'The cross product of the last two edge vectors — the orientation/turn test. If the three points do not make the required turn (the cross product has the wrong sign), the middle point is inside the hull and is popped. Distance and dot product do not determine turn direction.',
    'advanced',
    2,
    5000,
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
  ('dsa.math.counting_principle.lesson', 'dsa.math.counting_principle', true),
  ('dsa.math.counting_principle.mc_meal', 'dsa.math.counting_principle', true),
  ('dsa.math.generate_combinations.lesson', 'dsa.math.generate_combinations', true),
  ('dsa.math.generate_combinations.mc_unique', 'dsa.math.generate_combinations', true),
  ('dsa.math.convex_hull.lesson', 'dsa.math.convex_hull', true),
  ('dsa.math.convex_hull.mc_primitive', 'dsa.math.convex_hull', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.math.counting_principle.mc_meal.a', 'dsa.math.counting_principle.mc_meal', '24 — the rule of product (multiply independent choices)', true, 10),
  ('dsa.math.counting_principle.mc_meal.b', 'dsa.math.counting_principle.mc_meal', '10 — the rule of sum (add the options)', false, 20),
  ('dsa.math.counting_principle.mc_meal.c', 'dsa.math.counting_principle.mc_meal', '24 — the rule of sum', false, 30),
  ('dsa.math.counting_principle.mc_meal.d', 'dsa.math.counting_principle.mc_meal', '10 — the rule of product', false, 40),
  ('dsa.math.generate_combinations.mc_unique.a', 'dsa.math.generate_combinations.mc_unique', 'Recursing from an advancing start index (i + 1), so earlier elements are not revisited', true, 10),
  ('dsa.math.generate_combinations.mc_unique.b', 'dsa.math.generate_combinations.mc_unique', 'Sorting the output and removing duplicates at the end', false, 20),
  ('dsa.math.generate_combinations.mc_unique.c', 'dsa.math.generate_combinations.mc_unique', 'Shuffling the set before recursing', false, 30),
  ('dsa.math.generate_combinations.mc_unique.d', 'dsa.math.generate_combinations.mc_unique', 'Using a global visited set of values', false, 40),
  ('dsa.math.convex_hull.mc_primitive.a', 'dsa.math.convex_hull.mc_primitive', 'The cross product of the last two edge vectors (the turn/orientation test)', true, 10),
  ('dsa.math.convex_hull.mc_primitive.b', 'dsa.math.convex_hull.mc_primitive', 'The Euclidean distance between the points', false, 20),
  ('dsa.math.convex_hull.mc_primitive.c', 'dsa.math.convex_hull.mc_primitive', 'The dot product of the two edge vectors', false, 30),
  ('dsa.math.convex_hull.mc_primitive.d', 'dsa.math.convex_hull.mc_primitive', 'Comparing the x-coordinates only', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
