-- Roadmap #83 / #122: fixture-backed bit-row and coordinate trace items with
-- text equivalents for accessibility. Idempotent; mirrored in
-- src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.math.bit_manipulation.code_bit_row_trace',
    'code_reading',
    'Trace a bit test row',
    'Bit row:

```text
x        0 0 1 0 1 1 0 0  44 in 8-bit binary
x >> 3   0 0 0 0 0 1 0 1  shift bit 3 down to bit 0
& 1      0 0 0 0 0 0 0 1  mask all but the lowest bit
```

Text equivalent: 44 is 00101100 in binary. Shifting right by 3 gives 00000101, and masking with 1 isolates the low bit, so bit 3 is set.

For `int x = 44; int i = 3;`, trace `(x >> i) & 1`. Which bit of `x` is being tested, and what value does the expression produce?',
    'Bit index 3 is tested. 44 is 00101100, shifting right by 3 moves that bit to the lowest position, and `& 1` keeps only that lowest bit, so the result is 1. This is O(1). For wider masks, prefer unsigned or 64-bit masks such as `1ULL << i` so a shift does not overflow a signed int.',
    'advanced',
    4,
    2722,
    true
  ),
  (
    'dsa.math.vectors_dot_cross.code_coordinate_trace',
    'code_reading',
    'Trace an orientation diagram',
    'Coordinate diagram:

```text
y
4 |        C(2,3)
3 |      *
2 |
1 | A(0,0) ---- B(4,1)
0 | *              *
  +-------------------- x
```

Text equivalent: Point A is at (0,0), B is at (4,1), and C is above the directed segment from A to B at (2,3).

Result: cross(B - A, C - A) = 4*3 - 1*2 = 10, so C is a counter-clockwise left turn.

Given points `A(0,0)`, `B(4,1)`, and `C(2,3)`, compute `(B - A) x (C - A)`. Is C a left turn, right turn, or collinear with the directed segment AB?',
    'The cross product is `4*3 - 1*2 = 10`, which is positive, so C is a counter-clockwise left turn from AB. This orientation test is O(1), exact for integer coordinates while products fit the integer type, and should use 64-bit intermediates for large coordinate ranges.',
    'advanced',
    4,
    4362,
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
  ('dsa.math.bit_manipulation.code_bit_row_trace', 'dsa.math.bit_manipulation', true),
  ('dsa.math.vectors_dot_cross.code_coordinate_trace', 'dsa.math.vectors_dot_cross', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;
