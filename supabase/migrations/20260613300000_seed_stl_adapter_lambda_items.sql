-- Learning content for the STL adapter and lambda skills (#46, final STL slice).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.stl.adapters.lesson',
    'lesson',
    'Container adapters',
    'Container adapters wrap an underlying container to give a restricted interface. `std::stack<T>` is LIFO (`push`, `pop`, `top`); `std::queue<T>` is FIFO (`push`, `pop`, `front`); `std::priority_queue<T>` always exposes the largest element first by default (`push`, `pop`, `top`). Use a stack for depth-first/undo work, a queue for breadth-first/ordering, and a priority_queue when you repeatedly need the max (or min).',
    'Adapters express intent: reach for the one whose ordering matches the problem instead of managing a raw container by hand.',
    'intermediate',
    4,
    1410
  ),
  (
    'cpp.stl.adapters.mc_lifo',
    'multiple_choice',
    'Which adapter is LIFO',
    'Which container adapter gives Last-In-First-Out (LIFO) order?',
    '`std::stack` is LIFO: the most recently pushed element is the first popped. `std::queue` is FIFO, and `std::priority_queue` pops by priority.',
    'intermediate',
    2,
    1420
  ),
  (
    'cpp.stl.lambdas.lesson',
    'lesson',
    'Lambdas',
    'A lambda is an inline anonymous function, for example `[](int x){ return x * 2; }`. The leading `[]` is the capture list: it controls which surrounding variables the lambda can use and how — `[=]` captures by value, `[&]` by reference, and `[x]` captures just `x`. Lambdas are most often passed to algorithms, such as a comparator for `std::sort` or a predicate for `std::find_if`.',
    'Capture only what you need. Prefer capturing by value unless you must observe or modify the original, and be careful with [&] capturing locals that outlive the lambda.',
    'intermediate',
    4,
    1430
  ),
  (
    'cpp.stl.lambdas.mc_capture',
    'multiple_choice',
    'What the capture list controls',
    'In a lambda, what does the capture list `[]` control?',
    'The capture list controls which surrounding variables the lambda can use and whether they are captured by value or by reference. It does not declare the parameters or the return type.',
    'intermediate',
    2,
    1440
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
  ('cpp.stl.adapters.lesson', 'cpp.stl.adapters', true),
  ('cpp.stl.adapters.mc_lifo', 'cpp.stl.adapters', true),
  ('cpp.stl.lambdas.lesson', 'cpp.stl.lambdas', true),
  ('cpp.stl.lambdas.mc_capture', 'cpp.stl.lambdas', true),
  ('cpp.stl.lambdas.lesson', 'cpp.stl.algorithms', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.stl.adapters.mc_lifo.a', 'cpp.stl.adapters.mc_lifo', 'std::stack', true, 10),
  ('cpp.stl.adapters.mc_lifo.b', 'cpp.stl.adapters.mc_lifo', 'std::queue', false, 20),
  ('cpp.stl.adapters.mc_lifo.c', 'cpp.stl.adapters.mc_lifo', 'std::priority_queue', false, 30),
  ('cpp.stl.adapters.mc_lifo.d', 'cpp.stl.adapters.mc_lifo', 'std::vector', false, 40),

  ('cpp.stl.lambdas.mc_capture.a', 'cpp.stl.lambdas.mc_capture', 'Which surrounding variables the lambda uses, and whether by value or reference', true, 10),
  ('cpp.stl.lambdas.mc_capture.b', 'cpp.stl.lambdas.mc_capture', 'The return type of the lambda', false, 20),
  ('cpp.stl.lambdas.mc_capture.c', 'cpp.stl.lambdas.mc_capture', 'The parameters of the lambda', false, 30),
  ('cpp.stl.lambdas.mc_capture.d', 'cpp.stl.lambdas.mc_capture', 'The name of the lambda', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
