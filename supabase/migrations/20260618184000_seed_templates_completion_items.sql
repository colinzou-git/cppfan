-- Roadmap #70 / #112 final coverage: applied concepts diagnostics,
-- ranges tool selection, and view-lifetime bug spotting.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.templates.concepts_depth.code_diagnostic',
    'code_reading',
    'Reading a concept diagnostic',
    $prompt$A call `twice(3.14)` produces this shortened diagnostic: `candidate template ignored: constraints not satisfied [with T = double]` and `note: because double does not satisfy std::integral`. What requirement failed, and what is the smallest fix if floating-point inputs are valid?$prompt$,
    $explanation$The template was constrained with `std::integral`, so `double` is rejected before the function body is considered. If floating-point inputs are valid, change the constraint deliberately (for example add a `std::floating_point` overload or use a broader numeric concept); if they are not valid, pass an integral argument. The useful diagnostic is the failed constraint near the call site.$explanation$,
    'advanced',
    4,
    4710,
    true
  ),
  (
    'cpp.templates.ranges_depth.mc_choose_tool',
    'multiple_choice',
    'Choosing loop, algorithm, or view',
    $prompt$You need to uppercase every character of one `std::string` in place. Which approach is clearest?$prompt$,
    $explanation$For a small in-place mutation, a simple loop (or `std::ranges::transform` writing back to the same range) is direct and obvious. Lazy views are best when you want a non-owning pipeline that filters/transforms elements as they are iterated, not when you simply mutate one container.$explanation$,
    'advanced',
    2,
    4720,
    true
  ),
  (
    'cpp.templates.view_lifetime.bug_return_view',
    'bug_spotting',
    'Returning a view over a local',
    $prompt$Spot the bug: `auto small_values() { std::vector<int> values{1, 2, 3, 4}; return values | std::views::filter([](int x) { return x < 3; }); }`$prompt$,
    $explanation$`small_values` returns a view that refers to `values`, but `values` is destroyed when the function returns. Return an owning container, or accept a caller-owned range and document that the returned view must not outlive it.$explanation$,
    'advanced',
    3,
    4730,
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
  ('cpp.templates.concepts_depth.code_diagnostic', 'cpp.templates.concepts_depth', true),
  ('cpp.templates.ranges_depth.mc_choose_tool', 'cpp.templates.ranges_depth', true),
  ('cpp.templates.view_lifetime.bug_return_view', 'cpp.templates.view_lifetime', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.templates.ranges_depth.mc_choose_tool.a', 'cpp.templates.ranges_depth.mc_choose_tool', 'Use a simple loop, or std::ranges::transform writing back into the same string', true, 10),
  ('cpp.templates.ranges_depth.mc_choose_tool.b', 'cpp.templates.ranges_depth.mc_choose_tool', 'Build a lazy filter/transform/take view and ignore the original string', false, 20),
  ('cpp.templates.ranges_depth.mc_choose_tool.c', 'cpp.templates.ranges_depth.mc_choose_tool', 'Call std::ranges::sort first because range algorithms require sorted input', false, 30),
  ('cpp.templates.ranges_depth.mc_choose_tool.d', 'cpp.templates.ranges_depth.mc_choose_tool', 'Return a view over a local temporary string so the mutation happens later', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
