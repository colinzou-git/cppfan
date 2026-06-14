-- Roadmap #83 / #122 (geometry depth): learning items for dot/cross products,
-- segment intersection via orientation tests, and floating-point precision.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.math.vectors_dot_cross.lesson',
    'lesson',
    'Vectors: dot and cross products',
    'Represent a vector as a pair (x, y) — usually the difference of two points, B - A. Two products do most of the work in 2D geometry. The dot product a·b = ax*bx + ay*by measures alignment: it equals |a||b|cos(theta), so it is positive when the vectors point within 90 degrees of each other, zero when they are perpendicular, and negative when they point more than 90 degrees apart. It also gives projections and squared length (a·a = |a|^2). The 2D cross product a×b = ax*by - ay*bx is a scalar (the z-component of the 3D cross product); its magnitude is the area of the parallelogram spanned by a and b (twice the triangle area), and its sign is orientation: for vectors AB and AC, positive means C is a left/counter-clockwise turn from AB, negative means right/clockwise, and zero means the three points are collinear. This single orientation test underlies polygon area, convex hull, and segment intersection. Prefer the cross product over comparing slopes — slopes divide (and blow up on vertical lines), while the cross product is a multiplication that stays exact on integer coordinates.',
    'Dot product a·b = ax*bx+ay*by = |a||b|cos(theta): sign tells acute/perpendicular/obtuse, and gives projection/squared length. 2D cross a×b = ax*by-ay*bx: magnitude = parallelogram area (2x triangle), sign = orientation (CCW positive / CW negative / 0 collinear). Prefer cross over slopes (no division).',
    'advanced',
    6,
    4350,
    true
  ),
  (
    'dsa.math.vectors_dot_cross.mc_cross',
    'multiple_choice',
    'What the cross product sign tells you',
    'For 2D vectors AB and AC, the cross product (AB × AC) is positive. What does that mean about point C relative to line AB?',
    'A positive 2D cross product means C is a counter-clockwise (left) turn from AB. Negative means clockwise (right), and zero means A, B, C are collinear. The magnitude is twice the triangle area.',
    'advanced',
    2,
    4360,
    true
  ),
  (
    'dsa.math.segment_intersection.lesson',
    'lesson',
    'Segment intersection',
    'To decide whether two segments AB and CD cross, use the orientation test built from the cross product. Define orient(P, Q, R) as the sign of (Q - P) × (R - P): positive for a counter-clockwise turn, negative for clockwise, zero for collinear. The general (proper) case: AB and CD intersect when A and B are on opposite sides of line CD and C and D are on opposite sides of line AB — that is, orient(C, D, A) and orient(C, D, B) have opposite signs, and orient(A, B, C) and orient(A, B, D) have opposite signs. This catches crossings without computing the actual intersection point, using only multiplication and comparison (exact on integer coordinates). The collinear edge cases need separate handling: when an orientation is zero the points are collinear, so check whether the colinear point lies within the other segment''s bounding box (an on-segment test). Watch shared endpoints and overlapping collinear segments — decide explicitly whether touching counts as intersecting. Only compute the intersection coordinates if you actually need them; the orientation test alone answers the yes/no question.',
    'Use orient(P,Q,R) = sign((Q-P)×(R-P)). Segments AB, CD properly cross when orient(C,D,A) and orient(C,D,B) differ AND orient(A,B,C) and orient(A,B,D) differ. Zero orientations mean collinear — add an on-segment/bounding-box check. No division needed; exact on integers.',
    'advanced',
    6,
    4370,
    true
  ),
  (
    'dsa.math.segment_intersection.mc_test',
    'multiple_choice',
    'Detecting a proper crossing',
    'Which condition detects that segments AB and CD properly cross (excluding collinear/endpoint cases)?',
    'A and B must lie on opposite sides of line CD, and C and D on opposite sides of line AB — i.e. orient(C,D,A) vs orient(C,D,B) differ in sign and orient(A,B,C) vs orient(A,B,D) differ in sign. Equal-distance or slope equality does not determine crossing.',
    'advanced',
    2,
    4380,
    true
  ),
  (
    'dsa.math.geometry_precision.lesson',
    'lesson',
    'Geometry precision',
    'Floating-point is the main source of wrong-answer bugs in geometry. doubles cannot represent most decimals exactly, so errors accumulate and an exact equality test like `if (area == 0)` almost never behaves as intended. Two defenses. First, stay in integers when you can: if coordinates are integers, the cross product, dot product, doubled polygon area, and orientation tests are all exact integer arithmetic — never convert to double for these, and use a 64-bit type because products of coordinates can overflow 32 bits. Compare squared distances instead of distances to avoid sqrt entirely (sqrt both costs time and introduces error). Second, when doubles are unavoidable (angles, true lengths, intersection points), never compare with == or <; compare against a small epsilon: treat |a - b| < 1e-9 as equal, and a > eps / a < -eps for sign. Choose epsilon relative to the coordinate magnitude. Also avoid catastrophic cancellation (subtracting nearly equal large numbers) and prefer formulas that keep intermediate values small. Rule of thumb: integer-exact geometry first; epsilon comparisons only where real numbers are truly required.',
    'Prefer exact integer arithmetic (cross/dot/doubled-area/orientation are exact on integer coords; use 64-bit to avoid overflow); compare squared distances to skip sqrt. With doubles, never use == or raw <; compare with an epsilon (|a-b| < 1e-9) and watch catastrophic cancellation.',
    'advanced',
    6,
    4390,
    true
  ),
  (
    'dsa.math.geometry_precision.mc_compare',
    'multiple_choice',
    'Comparing floating-point geometry values',
    'You must compare two computed double areas for equality in a geometry routine. What is the safe approach?',
    'Compare with a tolerance: treat the values as equal when |a - b| < epsilon (e.g. 1e-9). A direct == almost always fails on doubles due to rounding; better still, use exact integer arithmetic when the coordinates are integers.',
    'advanced',
    2,
    4400,
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
  ('dsa.math.vectors_dot_cross.lesson', 'dsa.math.vectors_dot_cross', true),
  ('dsa.math.vectors_dot_cross.mc_cross', 'dsa.math.vectors_dot_cross', true),
  ('dsa.math.segment_intersection.lesson', 'dsa.math.segment_intersection', true),
  ('dsa.math.segment_intersection.mc_test', 'dsa.math.segment_intersection', true),
  ('dsa.math.geometry_precision.lesson', 'dsa.math.geometry_precision', true),
  ('dsa.math.geometry_precision.mc_compare', 'dsa.math.geometry_precision', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.math.vectors_dot_cross.mc_cross.a', 'dsa.math.vectors_dot_cross.mc_cross', 'C is a counter-clockwise (left) turn from AB', true, 10),
  ('dsa.math.vectors_dot_cross.mc_cross.b', 'dsa.math.vectors_dot_cross.mc_cross', 'C is a clockwise (right) turn from AB', false, 20),
  ('dsa.math.vectors_dot_cross.mc_cross.c', 'dsa.math.vectors_dot_cross.mc_cross', 'A, B, and C are collinear', false, 30),
  ('dsa.math.vectors_dot_cross.mc_cross.d', 'dsa.math.vectors_dot_cross.mc_cross', 'C lies exactly on segment AB', false, 40),
  ('dsa.math.segment_intersection.mc_test.a', 'dsa.math.segment_intersection.mc_test', 'A and B are on opposite sides of CD, and C and D are on opposite sides of AB (orientations differ)', true, 10),
  ('dsa.math.segment_intersection.mc_test.b', 'dsa.math.segment_intersection.mc_test', 'The two segments have equal length', false, 20),
  ('dsa.math.segment_intersection.mc_test.c', 'dsa.math.segment_intersection.mc_test', 'The two segments have the same slope', false, 30),
  ('dsa.math.segment_intersection.mc_test.d', 'dsa.math.segment_intersection.mc_test', 'Their midpoints coincide', false, 40),
  ('dsa.math.geometry_precision.mc_compare.a', 'dsa.math.geometry_precision.mc_compare', 'Treat them as equal when |a - b| < a small epsilon (e.g. 1e-9)', true, 10),
  ('dsa.math.geometry_precision.mc_compare.b', 'dsa.math.geometry_precision.mc_compare', 'Compare them directly with ==', false, 20),
  ('dsa.math.geometry_precision.mc_compare.c', 'dsa.math.geometry_precision.mc_compare', 'Round both to the nearest integer first', false, 30),
  ('dsa.math.geometry_precision.mc_compare.d', 'dsa.math.geometry_precision.mc_compare', 'Convert them to strings and compare text', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
