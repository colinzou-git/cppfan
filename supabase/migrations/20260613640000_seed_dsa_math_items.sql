-- Roadmap #65 / #83 (stage 14): learning items for bit manipulation, number theory, combinatorics, geometry.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.math.bit_manipulation.lesson',
    'lesson',
    'Bit manipulation',
    'Integers are sequences of bits, and bitwise operators let you work with them directly. AND (&) masks bits, OR (|) sets them, XOR (^) toggles them, and the shifts << / >> multiply or divide by powers of two. Common one-liners: test bit i with (x >> i) & 1; set it with x | (1 << i); clear it with x & ~(1 << i); toggle it with x ^ (1 << i). A neat trick, x & (x - 1), clears the lowest set bit, which makes counting set bits easy. Bit masks also encode small sets compactly — a single int can represent a subset of up to 32 elements.',
    'Use & to test/mask, | to set, ^ to toggle, and shifts to move bits; (x >> i) & 1 reads bit i and x | (1 << i) sets it.',
    'advanced',
    6,
    2710,
    true
  ),
  (
    'dsa.math.bit_manipulation.mc_test_bit',
    'multiple_choice',
    'Testing a bit',
    'Which expression checks whether bit i of an integer x is set (equal to 1)?',
    'Shifting x right by i brings bit i to the lowest position, and & 1 isolates it: (x >> i) & 1 is 1 when the bit is set, 0 otherwise.',
    'advanced',
    2,
    2720,
    true
  ),
  (
    'dsa.math.number_theory.lesson',
    'lesson',
    'Number theory',
    'A few number-theory tools recur constantly. The greatest common divisor is computed with Euclid''s algorithm: gcd(a, b) = gcd(b, a % b) until b is 0, running in O(log min(a, b)); std::gcd provides it directly. Primality of n can be tested by trial division up to sqrt(n). Modular arithmetic keeps numbers in range: (a + b) % m and (a * b) % m let you compute large results without overflow, which is why competitive problems ask for answers "modulo 1e9+7". Remember that in C++ the % operator can return a negative result for negative operands, so normalize when needed.',
    'Euclid''s algorithm computes gcd in O(log n); test primality by trial division to sqrt(n); use modular arithmetic to keep large products in range.',
    'advanced',
    6,
    2730,
    true
  ),
  (
    'dsa.math.number_theory.mc_gcd',
    'multiple_choice',
    'Euclid''s algorithm',
    'Euclid''s algorithm computes gcd(a, b) by repeatedly applying which step?',
    'Euclid''s algorithm replaces (a, b) with (b, a % b) until the second value is 0; the remaining first value is the gcd. This runs in O(log min(a, b)).',
    'advanced',
    2,
    2740,
    true
  ),
  (
    'dsa.math.combinatorics.lesson',
    'lesson',
    'Combinatorics',
    'Combinatorics counts how many ways things can happen. A permutation counts ordered arrangements: the number of ways to order r of n distinct items is P(n, r) = n! / (n - r)!. A combination counts unordered selections: C(n, r) = n! / (r! (n - r)!), often read "n choose r". The deciding question is whether order matters — picking a 3-person committee from 10 people is a combination (order irrelevant), while awarding gold/silver/bronze to 3 of 10 runners is a permutation (order matters). For repeated counting, Pascal''s rule C(n, r) = C(n-1, r-1) + C(n-1, r) builds a table that avoids recomputing factorials.',
    'Permutations count ordered arrangements (order matters); combinations count unordered selections (order does not). C(n, r) = n! / (r!(n-r)!).',
    'advanced',
    6,
    2750,
    true
  ),
  (
    'dsa.math.combinatorics.mc_committee',
    'multiple_choice',
    'Permutation or combination',
    'Counting how many 3-person committees can be formed from 10 people uses which?',
    'A committee has no internal order — the same three people are one committee regardless of who is named first — so it is a combination, C(10, 3). If order mattered (e.g. president/VP/secretary) it would be a permutation.',
    'advanced',
    2,
    2760,
    true
  ),
  (
    'dsa.math.geometry.lesson',
    'lesson',
    'Computational geometry',
    'Geometry problems start with points in the plane, often as a pair of coordinates. The Euclidean distance between (x1, y1) and (x2, y2) is sqrt((x2-x1)^2 + (y2-y1)^2); when you only need to compare distances, skip the sqrt and compare squared distances to avoid floating-point error. The cross product of vectors AB and AC, (Bx-Ax)(Cy-Ay) - (By-Ay)(Cx-Ax), is a workhorse: its sign tells you whether C is to the left of AB (positive, counter-clockwise turn), to the right (negative, clockwise), or collinear (zero). That orientation test underlies convex-hull and segment-intersection algorithms.',
    'Compare squared distances to avoid sqrt error; the sign of the cross product gives orientation (left/right/collinear), the basis of hull and intersection tests.',
    'advanced',
    6,
    2770,
    true
  ),
  (
    'dsa.math.geometry.mc_cross',
    'multiple_choice',
    'What the cross product tells you',
    'What does the sign of the 2D cross product of vectors AB and AC tell you?',
    'The cross product sign gives orientation: positive means C is a counter-clockwise (left) turn from AB, negative means clockwise (right), and zero means the three points are collinear.',
    'advanced',
    2,
    2780,
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
  ('dsa.math.bit_manipulation.lesson', 'dsa.math.bit_manipulation', true),
  ('dsa.math.bit_manipulation.mc_test_bit', 'dsa.math.bit_manipulation', true),
  ('dsa.math.number_theory.lesson', 'dsa.math.number_theory', true),
  ('dsa.math.number_theory.mc_gcd', 'dsa.math.number_theory', true),
  ('dsa.math.combinatorics.lesson', 'dsa.math.combinatorics', true),
  ('dsa.math.combinatorics.mc_committee', 'dsa.math.combinatorics', true),
  ('dsa.math.geometry.lesson', 'dsa.math.geometry', true),
  ('dsa.math.geometry.mc_cross', 'dsa.math.geometry', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.math.bit_manipulation.mc_test_bit.a', 'dsa.math.bit_manipulation.mc_test_bit', '(x >> i) & 1', true, 10),
  ('dsa.math.bit_manipulation.mc_test_bit.b', 'dsa.math.bit_manipulation.mc_test_bit', 'x % i', false, 20),
  ('dsa.math.bit_manipulation.mc_test_bit.c', 'dsa.math.bit_manipulation.mc_test_bit', 'x ^ i', false, 30),
  ('dsa.math.bit_manipulation.mc_test_bit.d', 'dsa.math.bit_manipulation.mc_test_bit', 'x << i', false, 40),
  ('dsa.math.number_theory.mc_gcd.a', 'dsa.math.number_theory.mc_gcd', 'Replace (a, b) with (b, a % b) until b is 0', true, 10),
  ('dsa.math.number_theory.mc_gcd.b', 'dsa.math.number_theory.mc_gcd', 'Multiply a and b repeatedly', false, 20),
  ('dsa.math.number_theory.mc_gcd.c', 'dsa.math.number_theory.mc_gcd', 'Subtract 1 from both until they match', false, 30),
  ('dsa.math.number_theory.mc_gcd.d', 'dsa.math.number_theory.mc_gcd', 'Add a and b until one is prime', false, 40),
  ('dsa.math.combinatorics.mc_committee.a', 'dsa.math.combinatorics.mc_committee', 'A combination, because order does not matter', true, 10),
  ('dsa.math.combinatorics.mc_committee.b', 'dsa.math.combinatorics.mc_committee', 'A permutation, because order matters', false, 20),
  ('dsa.math.combinatorics.mc_committee.c', 'dsa.math.combinatorics.mc_committee', 'Neither; it is just 10 times 3', false, 30),
  ('dsa.math.combinatorics.mc_committee.d', 'dsa.math.combinatorics.mc_committee', 'A factorial of 10', false, 40),
  ('dsa.math.geometry.mc_cross.a', 'dsa.math.geometry.mc_cross', 'The orientation: left turn, right turn, or collinear', true, 10),
  ('dsa.math.geometry.mc_cross.b', 'dsa.math.geometry.mc_cross', 'The exact distance between the points', false, 20),
  ('dsa.math.geometry.mc_cross.c', 'dsa.math.geometry.mc_cross', 'Whether the points are integers', false, 30),
  ('dsa.math.geometry.mc_cross.d', 'dsa.math.geometry.mc_cross', 'The number of points on the line', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
