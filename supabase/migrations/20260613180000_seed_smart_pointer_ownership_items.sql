-- Learning content for the new smart-pointer ownership skills (#45).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.smart_pointers.ownership_choice.lesson',
    'lesson',
    'Choosing how to own a value',
    'Prefer the simplest ownership that works. If an object can live as a value member or a local stack variable with a clear lifetime, do that — no smart pointer needed. Use a non-owning reference or raw pointer when code only observes a value it does not own. Reach for `std::unique_ptr` or `std::shared_ptr` only when you need heap allocation with automatic cleanup, runtime polymorphism, or a genuinely shared lifetime.',
    'A common beginner habit is wrapping everything in shared_ptr. Start with values and references, and add a smart pointer only when ownership truly requires the heap.',
    'intermediate',
    4,
    710
  ),
  (
    'cpp.smart_pointers.ownership_choice.mc_simplest',
    'multiple_choice',
    'The simplest ownership',
    'You need a member that always lives exactly as long as its containing object and is never shared. What is the simplest choice?',
    'When the member shares the owner lifetime and is not shared or polymorphic, a plain value member is simplest and safest — no heap and no smart pointer needed.',
    'intermediate',
    2,
    720
  ),
  (
    'cpp.smart_pointers.ownership_transfer.mc_moved_from',
    'multiple_choice',
    'State after std::move',
    'After `auto b = std::move(a);` where `a` is a `std::unique_ptr`, what is the state of `a`?',
    'std::move transfers ownership: b takes the object and a is left empty (null). a may be reassigned later, but dereferencing it before that is undefined behavior.',
    'intermediate',
    2,
    730
  ),
  (
    'cpp.smart_pointers.ownership_transfer.bug_use_after_move',
    'bug_spotting',
    'Spot the use-after-move',
    'This is undefined behavior:\n\n```cpp\nauto a = std::make_unique<Widget>();\nauto b = std::move(a);\na->use(); // here\n```\n\nWhy is the marked line wrong?',
    'After `std::move(a)`, ownership moved to b and a is empty (null). Dereferencing a with `a->use()` is undefined behavior. Use b, which now owns the Widget.',
    'intermediate',
    3,
    740
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
  ('cpp.smart_pointers.ownership_choice.lesson', 'cpp.smart_pointers.ownership_choice', true),
  ('cpp.smart_pointers.ownership_choice.mc_simplest', 'cpp.smart_pointers.ownership_choice', true),
  ('cpp.smart_pointers.ownership_transfer.mc_moved_from', 'cpp.smart_pointers.ownership_transfer', true),
  ('cpp.smart_pointers.ownership_transfer.bug_use_after_move', 'cpp.smart_pointers.ownership_transfer', true),
  ('cpp.smart_pointers.ownership_transfer.bug_use_after_move', 'cpp.smart_pointers.unique_ptr', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.smart_pointers.ownership_choice.mc_simplest.a', 'cpp.smart_pointers.ownership_choice.mc_simplest', 'A plain value member', true, 10),
  ('cpp.smart_pointers.ownership_choice.mc_simplest.b', 'cpp.smart_pointers.ownership_choice.mc_simplest', 'A std::shared_ptr<T> member', false, 20),
  ('cpp.smart_pointers.ownership_choice.mc_simplest.c', 'cpp.smart_pointers.ownership_choice.mc_simplest', 'A std::unique_ptr<T> member', false, 30),
  ('cpp.smart_pointers.ownership_choice.mc_simplest.d', 'cpp.smart_pointers.ownership_choice.mc_simplest', 'A raw owning pointer freed in the destructor', false, 40),

  ('cpp.smart_pointers.ownership_transfer.mc_moved_from.a', 'cpp.smart_pointers.ownership_transfer.mc_moved_from', 'a is empty (null); the object now belongs to b', true, 10),
  ('cpp.smart_pointers.ownership_transfer.mc_moved_from.b', 'cpp.smart_pointers.ownership_transfer.mc_moved_from', 'a and b both own the object', false, 20),
  ('cpp.smart_pointers.ownership_transfer.mc_moved_from.c', 'cpp.smart_pointers.ownership_transfer.mc_moved_from', 'a is unchanged and still owns the object', false, 30),
  ('cpp.smart_pointers.ownership_transfer.mc_moved_from.d', 'cpp.smart_pointers.ownership_transfer.mc_moved_from', 'a is destroyed and cannot be reassigned', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
