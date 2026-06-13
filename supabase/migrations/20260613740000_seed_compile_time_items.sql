-- Roadmap #70 / #112 (templates follow-up): learning items for compile-time
-- programming — constexpr, if constexpr, and static_assert.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.templates.constexpr.lesson',
    'lesson',
    'constexpr functions and values',
    'constexpr marks something that can be evaluated at compile time. A constexpr variable is a true compile-time constant — usable as an array size or template argument. A constexpr function may run at compile time when all its arguments are constant expressions, and otherwise runs normally at run time; the same definition serves both. For example constexpr int square(int n) { return n * n; } lets constexpr int n = square(5); be computed by the compiler, while square(x) for a runtime x just runs at run time. Use it to move work to compile time and to define real constants instead of macros. (consteval, by contrast, requires compile-time evaluation.) A constexpr function is limited to operations valid in constant evaluation, but those rules have relaxed a lot in modern C++.',
    'constexpr means "usable at compile time": a constexpr value is a compile-time constant; a constexpr function runs at compile time when its inputs are constant, else at run time.',
    'advanced',
    5,
    3090,
    true
  ),
  (
    'cpp.templates.constexpr.mc_eval',
    'multiple_choice',
    'When constexpr runs at compile time',
    'When is a call to a constexpr function evaluated at compile time?',
    'When it appears in a constant-expression context and all its arguments are themselves constant expressions (e.g. initializing a constexpr variable or an array bound). With runtime arguments the same function simply runs at run time.',
    'advanced',
    2,
    3100,
    true
  ),
  (
    'cpp.templates.if_constexpr.lesson',
    'lesson',
    'if constexpr',
    'if constexpr (cond) chooses a branch at compile time: the condition must be a constant expression, and the branch not taken is discarded — not instantiated for that template instantiation. This is what lets a single function template handle types that would make the other branch ill-formed. For example, in a template print(T v), if constexpr (std::is_pointer_v<T>) { std::cout << *v; } else { std::cout << v; } compiles for both pointers and non-pointers, because the *v branch is discarded when T is not a pointer. With a plain runtime if, both branches must compile for every T, so *v on a non-pointer would be an error. Reach for if constexpr when the right code depends on a compile-time property of a type.',
    'if constexpr picks a branch at compile time and discards the other (it is not instantiated), so a template can contain branches that would be ill-formed for some types.',
    'advanced',
    5,
    3110,
    true
  ),
  (
    'cpp.templates.if_constexpr.mc_discarded',
    'multiple_choice',
    'What if constexpr does',
    'In a function template, what is special about the branch NOT taken by if constexpr?',
    'The discarded branch is not instantiated for that template specialization, so it may contain code that would be ill-formed for the current type. A runtime if would require every branch to compile for every type.',
    'advanced',
    2,
    3120,
    true
  ),
  (
    'cpp.templates.static_assert.lesson',
    'lesson',
    'static_assert',
    'static_assert(condition, "message") checks a compile-time condition and, if it is false, stops the build with your message — no run-time cost, no run-time path. It is ideal for enforcing assumptions a template or type relies on: static_assert(sizeof(int) >= 4, "needs 32-bit int"); or, with type traits, static_assert(std::is_trivially_copyable_v<T>, "T must be trivially copyable");. Because it fires during compilation, it catches violations before the program ever runs and documents the requirement right where it matters. The condition must be a constant expression; pair it with constexpr values and type traits. Prefer a clear message — it becomes the diagnostic the next developer reads.',
    'static_assert(cond, "msg") fails the build at compile time with your message when cond is false. Use it to enforce and document type/size/trait assumptions with zero runtime cost.',
    'intermediate',
    4,
    3130,
    true
  ),
  (
    'cpp.templates.static_assert.mc_when',
    'multiple_choice',
    'What static_assert does',
    'What happens when a static_assert condition is false?',
    'Compilation fails with the supplied message. static_assert is a compile-time check, so the violation is caught during the build and never reaches run time.',
    'intermediate',
    2,
    3140,
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
  ('cpp.templates.constexpr.lesson', 'cpp.templates.constexpr', true),
  ('cpp.templates.constexpr.mc_eval', 'cpp.templates.constexpr', true),
  ('cpp.templates.if_constexpr.lesson', 'cpp.templates.if_constexpr', true),
  ('cpp.templates.if_constexpr.mc_discarded', 'cpp.templates.if_constexpr', true),
  ('cpp.templates.static_assert.lesson', 'cpp.templates.static_assert', true),
  ('cpp.templates.static_assert.mc_when', 'cpp.templates.static_assert', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.templates.constexpr.mc_eval.a', 'cpp.templates.constexpr.mc_eval', 'When it is used in a constant-expression context with constant arguments', true, 10),
  ('cpp.templates.constexpr.mc_eval.b', 'cpp.templates.constexpr.mc_eval', 'Always, on every call, even with runtime arguments', false, 20),
  ('cpp.templates.constexpr.mc_eval.c', 'cpp.templates.constexpr.mc_eval', 'Never; constexpr is only documentation', false, 30),
  ('cpp.templates.constexpr.mc_eval.d', 'cpp.templates.constexpr.mc_eval', 'Only inside a class template', false, 40),
  ('cpp.templates.if_constexpr.mc_discarded.a', 'cpp.templates.if_constexpr.mc_discarded', 'It is not instantiated, so it may contain code ill-formed for the current type', true, 10),
  ('cpp.templates.if_constexpr.mc_discarded.b', 'cpp.templates.if_constexpr.mc_discarded', 'It still must compile for every type, like a runtime if', false, 20),
  ('cpp.templates.if_constexpr.mc_discarded.c', 'cpp.templates.if_constexpr.mc_discarded', 'It runs at run time as a fallback', false, 30),
  ('cpp.templates.if_constexpr.mc_discarded.d', 'cpp.templates.if_constexpr.mc_discarded', 'It is executed twice', false, 40),
  ('cpp.templates.static_assert.mc_when.a', 'cpp.templates.static_assert.mc_when', 'Compilation fails with the supplied message', true, 10),
  ('cpp.templates.static_assert.mc_when.b', 'cpp.templates.static_assert.mc_when', 'The program throws an exception at run time', false, 20),
  ('cpp.templates.static_assert.mc_when.c', 'cpp.templates.static_assert.mc_when', 'It logs a warning and continues', false, 30),
  ('cpp.templates.static_assert.mc_when.d', 'cpp.templates.static_assert.mc_when', 'Nothing until the assertion is reached at run time', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
