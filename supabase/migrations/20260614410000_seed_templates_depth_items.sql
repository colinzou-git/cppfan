-- Roadmap #70 / #112 (templates depth): learning items for concepts in depth,
-- ranges algorithms + lazy views, and view lifetime / dangling.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.templates.concepts_depth.lesson',
    'lesson',
    'Concepts in depth',
    'A concept is a named, compile-time predicate on types that you use to constrain a template. Instead of an unconstrained `template <typename T>`, you write `template <std::integral T>` or add a `requires` clause like `requires std::integral<T>`; the function then only participates in overload resolution for types that satisfy the concept. The standard library ships many concepts in <concepts> and <ranges> (`std::integral`, `std::floating_point`, `std::totally_ordered`, `std::same_as`, `std::convertible_to`). Three wins: intent — the signature documents what the type must support; diagnostics — a violation reports that the constraint was not satisfied at the call site instead of a deep, cryptic error from inside the template body; and correctness — you exclude types that would compile but misbehave. You can also write an abbreviated function template using a constrained auto parameter: `void f(std::integral auto x)`. Define your own with `template <class T> concept Addable = requires (T a, T b) { a + b; };`. Prefer constraining with an existing standard concept before inventing one.',
    'A concept is a named compile-time predicate constraining a template (`template <std::integral T>` or a `requires` clause). It documents intent, fails with a clear constraint message at the call site rather than deep template errors, and excludes types that would misbehave. `std::integral auto x` is an abbreviated constrained parameter.',
    'advanced',
    6,
    4650,
    true
  ),
  (
    'cpp.templates.concepts_depth.mc_why',
    'multiple_choice',
    'Why constrain with a concept',
    'Why constrain a template with a concept like `std::integral` instead of leaving it unconstrained?',
    'A concept makes the requirement explicit and produces a clear constraint-not-satisfied error at the call site, instead of a deep error from inside the template body; it also removes the function from overload resolution for unsupported types.',
    'advanced',
    2,
    4660,
    true
  ),
  (
    'cpp.templates.ranges_depth.lesson',
    'lesson',
    'Ranges algorithms and lazy views',
    'The ranges library (C++20) lets you call algorithms on a whole range and compose lazy views. Instead of `std::sort(v.begin(), v.end())` you write `std::ranges::sort(v)` — fewer iterator pairs to get wrong, and the std::ranges algorithms add projections and concept-checked constraints. Views are lazy, composable adaptors: `v | std::views::filter(pred) | std::views::transform(f) | std::views::take(3)` describes a pipeline that does no work until you iterate it, and touches each element at most once as results are pulled through. Because views are lazy they avoid building intermediate containers — filtering then transforming a million elements allocates nothing extra. Read the pipe left to right as a data flow. When you actually need a container, materialize the result (copy into a vector, or `std::ranges::to` in C++23). Use ranges algorithms for clarity and views to express transformations without temporary vectors.',
    '`std::ranges::sort(v)` and other ranges algorithms take a whole range (plus optional projection) instead of iterator pairs — fewer mistakes, concept-checked. Views (`views::filter`/`transform`/`take`) are lazy, composable, allocation-free pipelines evaluated only when iterated; materialize into a container when you need one.',
    'advanced',
    6,
    4670,
    true
  ),
  (
    'cpp.templates.ranges_depth.mc_lazy',
    'multiple_choice',
    'How a view pipeline evaluates',
    'What is true of `nums | std::views::filter(even) | std::views::transform(square)`?',
    'Views are lazy: the pipeline does no work until iterated, then processes elements on demand without building intermediate containers. It is not evaluated eagerly into temporary vectors.',
    'advanced',
    2,
    4680,
    true
  ),
  (
    'cpp.templates.view_lifetime.lesson',
    'lesson',
    'View lifetime and dangling',
    'A view does not own its elements — it is a lightweight handle referring to some underlying range. That makes views cheap to copy and compose, but a view is only valid while the range it refers to stays alive. The classic bug is returning a view over a local or temporary: a function that builds a local `std::vector<int> v` and returns `v | std::views::filter(p)` returns a view into v, which is destroyed when the function returns — the result dangles. The same trap appears when you build a view over a temporary container expression, or keep a view after the source vector reallocates or goes out of scope. Rules of thumb: do not return a view that refers to a local; do not store a view longer than its source lives; if you need an owning result, materialize it (copy into a vector, or `std::ranges::to<std::vector>()` in C++23). Some adaptors over rvalue ranges are constrained for this reason (owning_view and the borrowed-range concept make the safe cases explicit). Treat a view like a pointer into a container: valid only as long as the container is.',
    'A view is a non-owning handle into another range, valid only while that range lives. Returning a view over a local/temporary, or keeping one after the source is destroyed or reallocates, dangles. Materialize (copy into a vector, or std::ranges::to in C++23) when the result must outlive the source; treat a view like a pointer into a container.',
    'advanced',
    6,
    4690,
    true
  ),
  (
    'cpp.templates.view_lifetime.mc_dangling',
    'multiple_choice',
    'Why a returned view can dangle',
    'Why can returning `local_vector | std::views::filter(pred)` from a function be a bug?',
    'A view does not own its elements; it refers to local_vector. When the function returns, local_vector is destroyed, so the returned view dangles. Materialize into an owning container instead.',
    'advanced',
    2,
    4700,
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
  ('cpp.templates.concepts_depth.lesson', 'cpp.templates.concepts_depth', true),
  ('cpp.templates.concepts_depth.mc_why', 'cpp.templates.concepts_depth', true),
  ('cpp.templates.ranges_depth.lesson', 'cpp.templates.ranges_depth', true),
  ('cpp.templates.ranges_depth.mc_lazy', 'cpp.templates.ranges_depth', true),
  ('cpp.templates.view_lifetime.lesson', 'cpp.templates.view_lifetime', true),
  ('cpp.templates.view_lifetime.mc_dangling', 'cpp.templates.view_lifetime', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.templates.concepts_depth.mc_why.a', 'cpp.templates.concepts_depth.mc_why', 'It documents the requirement and gives a clear constraint error at the call site', true, 10),
  ('cpp.templates.concepts_depth.mc_why.b', 'cpp.templates.concepts_depth.mc_why', 'It makes the template run faster at run time', false, 20),
  ('cpp.templates.concepts_depth.mc_why.c', 'cpp.templates.concepts_depth.mc_why', 'It is required syntax; templates do not compile without concepts', false, 30),
  ('cpp.templates.concepts_depth.mc_why.d', 'cpp.templates.concepts_depth.mc_why', 'It converts arguments to integers automatically', false, 40),
  ('cpp.templates.ranges_depth.mc_lazy.a', 'cpp.templates.ranges_depth.mc_lazy', 'It is lazy — no work happens until you iterate it, and no intermediate container is built', true, 10),
  ('cpp.templates.ranges_depth.mc_lazy.b', 'cpp.templates.ranges_depth.mc_lazy', 'It eagerly builds a filtered vector, then a transformed vector', false, 20),
  ('cpp.templates.ranges_depth.mc_lazy.c', 'cpp.templates.ranges_depth.mc_lazy', 'It sorts the elements as a side effect', false, 30),
  ('cpp.templates.ranges_depth.mc_lazy.d', 'cpp.templates.ranges_depth.mc_lazy', 'It copies nums before filtering', false, 40),
  ('cpp.templates.view_lifetime.mc_dangling.a', 'cpp.templates.view_lifetime.mc_dangling', 'The view refers to the local vector, which is destroyed on return — the view dangles', true, 10),
  ('cpp.templates.view_lifetime.mc_dangling.b', 'cpp.templates.view_lifetime.mc_dangling', 'Views cannot be returned from functions at all', false, 20),
  ('cpp.templates.view_lifetime.mc_dangling.c', 'cpp.templates.view_lifetime.mc_dangling', 'filter copies the vector, doubling memory', false, 30),
  ('cpp.templates.view_lifetime.mc_dangling.d', 'cpp.templates.view_lifetime.mc_dangling', 'The predicate runs too early', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
