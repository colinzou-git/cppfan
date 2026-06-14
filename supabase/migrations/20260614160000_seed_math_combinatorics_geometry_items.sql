-- Roadmap #83 / #122 (math, second slice): learning items for binomial
-- coefficients and the Pascal triangle, inclusion-exclusion, and polygon area.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.math.pascal_binomial.lesson',
    'lesson',
    'Binomial coefficients and Pascal''s triangle',
    'The binomial coefficient C(n, k) ("n choose k") counts how many ways you can choose k items from n without regard to order. Two ways to compute it. Pascal''s recurrence builds a table: C(n, k) = C(n-1, k-1) + C(n-1, k), with base cases C(n, 0) = C(n, n) = 1 — each entry is the sum of the two above it, which is Pascal''s triangle. Filling an n-by-k table is O(n*k) time and avoids any division or overflow of intermediate factorials, so it is ideal when you need many coefficients or are working modulo a prime. The direct formula C(n, k) = n! / (k! * (n-k)!) is O(n) with precomputed factorials, but n! overflows fast, so under a modulus you multiply by modular inverses of the factorials rather than dividing. Useful identities: C(n, k) = C(n, n-k) (symmetry), the row of C(n, *) sums to 2^n, and C(n, 1) = n. Choose Pascal''s triangle for small n or many queries, factorials-with-inverses for large n under a modulus.',
    'C(n,k) counts unordered choices. Pascal''s recurrence C(n,k)=C(n-1,k-1)+C(n-1,k) fills a table in O(n*k) with no division/overflow; the factorial formula n!/(k!(n-k)!) is O(n) but needs modular inverses under a modulus. Use symmetry C(n,k)=C(n,n-k).',
    'advanced',
    6,
    4290,
    true
  ),
  (
    'dsa.math.pascal_binomial.mc_recurrence',
    'multiple_choice',
    'Pascal''s recurrence',
    'Which recurrence builds binomial coefficients (Pascal''s triangle)?',
    'C(n, k) = C(n-1, k-1) + C(n-1, k): each entry is the sum of the two directly above it, with C(n, 0) = C(n, n) = 1. This avoids factorial overflow and division.',
    'advanced',
    2,
    4300,
    true
  ),
  (
    'dsa.math.inclusion_exclusion.lesson',
    'lesson',
    'Inclusion-exclusion',
    'Inclusion-exclusion counts the size of a union of overlapping sets without double-counting. For two sets, |A ∪ B| = |A| + |B| - |A ∩ B|: add the parts, then subtract the overlap you counted twice. For three, |A ∪ B ∪ C| = |A| + |B| + |C| - |A ∩ B| - |A ∩ C| - |B ∩ C| + |A ∩ B ∩ C|: add singles, subtract pairs, add the triple. The general rule alternates sign by the number of sets intersected: add odd-sized intersections, subtract even-sized ones. A classic application is counting integers up to N divisible by at least one of several primes: add the counts for each prime (N/p), subtract for each pair (N/(p*q)), and so on. With k sets there are 2^k - 1 non-empty subsets to combine, so inclusion-exclusion is practical when k is small (often paired with bitmask enumeration over the subsets). It also underlies counting derangements and Euler''s totient via prime factors.',
    '|A ∪ B| = |A| + |B| - |A ∩ B|; in general add odd-sized intersections and subtract even-sized ones to avoid double-counting. Classic use: count numbers up to N divisible by some prime (add N/p, subtract N/(p*q), ...). 2^k - 1 terms, so best for small k (often via bitmasks).',
    'advanced',
    6,
    4310,
    true
  ),
  (
    'dsa.math.inclusion_exclusion.mc_two_sets',
    'multiple_choice',
    'Size of a union',
    'For two overlapping sets A and B, what is |A ∪ B|?',
    '|A ∪ B| = |A| + |B| - |A ∩ B|. Adding the two sizes counts the overlap twice, so you subtract |A ∩ B| once to correct it.',
    'advanced',
    2,
    4320,
    true
  ),
  (
    'dsa.math.geometry_area.lesson',
    'lesson',
    'Polygon area (shoelace)',
    'The shoelace formula gives the area of any simple polygon (one whose edges do not cross) from its ordered vertices (x0, y0), (x1, y1), ..., (x(n-1), y(n-1)). Sum the cross products of consecutive vertices and halve the absolute value: area = |sum over i of (x_i * y_(i+1) - x_(i+1) * y_i)| / 2, where the index wraps so the last vertex connects back to the first. The name comes from the criss-cross multiplication pattern, like lacing a shoe. Two cautions: the vertices must be given in order around the polygon (all clockwise or all counter-clockwise) or the result is wrong; and the signed value (before taking the absolute value) tells you orientation — positive for counter-clockwise, negative for clockwise — which is useful on its own. It runs in O(n). For integer coordinates the doubled area (skip the /2) is an exact integer, handy with Pick''s theorem, which relates a lattice polygon''s area to its interior and boundary lattice points.',
    'Shoelace: area = |sum of (x_i*y_(i+1) - x_(i+1)*y_i)| / 2 over the ordered vertices (indices wrap). Vertices must be in order around the polygon; the signed sum also gives orientation (CCW positive). O(n); doubled area is an exact integer for integer coordinates.',
    'advanced',
    6,
    4330,
    true
  ),
  (
    'dsa.math.geometry_area.mc_order',
    'multiple_choice',
    'A requirement of the shoelace formula',
    'What must be true of a polygon''s vertices for the shoelace formula to give the correct area?',
    'The vertices must be listed in order around the polygon''s boundary (consistently clockwise or counter-clockwise). Out-of-order vertices describe a different (self-crossing) shape and give a wrong area.',
    'advanced',
    2,
    4340,
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
  ('dsa.math.pascal_binomial.lesson', 'dsa.math.pascal_binomial', true),
  ('dsa.math.pascal_binomial.mc_recurrence', 'dsa.math.pascal_binomial', true),
  ('dsa.math.inclusion_exclusion.lesson', 'dsa.math.inclusion_exclusion', true),
  ('dsa.math.inclusion_exclusion.mc_two_sets', 'dsa.math.inclusion_exclusion', true),
  ('dsa.math.geometry_area.lesson', 'dsa.math.geometry_area', true),
  ('dsa.math.geometry_area.mc_order', 'dsa.math.geometry_area', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.math.pascal_binomial.mc_recurrence.a', 'dsa.math.pascal_binomial.mc_recurrence', 'C(n, k) = C(n-1, k-1) + C(n-1, k)', true, 10),
  ('dsa.math.pascal_binomial.mc_recurrence.b', 'dsa.math.pascal_binomial.mc_recurrence', 'C(n, k) = C(n-1, k) * C(n-1, k-1)', false, 20),
  ('dsa.math.pascal_binomial.mc_recurrence.c', 'dsa.math.pascal_binomial.mc_recurrence', 'C(n, k) = C(n, k-1) + 1', false, 30),
  ('dsa.math.pascal_binomial.mc_recurrence.d', 'dsa.math.pascal_binomial.mc_recurrence', 'C(n, k) = n * k', false, 40),
  ('dsa.math.inclusion_exclusion.mc_two_sets.a', 'dsa.math.inclusion_exclusion.mc_two_sets', '|A| + |B| - |A ∩ B|', true, 10),
  ('dsa.math.inclusion_exclusion.mc_two_sets.b', 'dsa.math.inclusion_exclusion.mc_two_sets', '|A| + |B|', false, 20),
  ('dsa.math.inclusion_exclusion.mc_two_sets.c', 'dsa.math.inclusion_exclusion.mc_two_sets', '|A| + |B| + |A ∩ B|', false, 30),
  ('dsa.math.inclusion_exclusion.mc_two_sets.d', 'dsa.math.inclusion_exclusion.mc_two_sets', '|A| * |B| - |A ∩ B|', false, 40),
  ('dsa.math.geometry_area.mc_order.a', 'dsa.math.geometry_area.mc_order', 'The vertices must be given in order around the polygon (consistently CW or CCW)', true, 10),
  ('dsa.math.geometry_area.mc_order.b', 'dsa.math.geometry_area.mc_order', 'The vertices must be sorted by x-coordinate', false, 20),
  ('dsa.math.geometry_area.mc_order.c', 'dsa.math.geometry_area.mc_order', 'All coordinates must be positive', false, 30),
  ('dsa.math.geometry_area.mc_order.d', 'dsa.math.geometry_area.mc_order', 'The polygon must be a triangle or rectangle', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
