-- cppFan curriculum expansion (#43): learning items for the cpp.smart_pointers
-- module, completing the initial four C++ modules. Two items per skill,
-- following the established content style. Idempotent upserts; mirrored in
-- src/features/learning-items/learning-item-seed.ts.
--
-- No schema or item-type changes; content only.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.smart_pointers.unique_ptr.lesson',
    'lesson',
    'unique_ptr: unique ownership',
    'A `std::unique_ptr<T>` owns a single heap object and frees it automatically when the unique_ptr goes out of scope. It models *unique* ownership, so it cannot be copied — only one unique_ptr may own the object at a time. Ownership can be transferred with `std::move`. Create one with `std::make_unique<T>(...)`.',
    'unique_ptr is the default smart pointer: zero-overhead, automatic cleanup, and the type system prevents accidental shared ownership.',
    'intermediate',
    4,
    610
  ),
  (
    'cpp.smart_pointers.unique_ptr.mc_no_copy',
    'multiple_choice',
    'Why unique_ptr cannot be copied',
    'Why is `std::unique_ptr` not copyable?',
    'Copying would create two owners of the same object, and both would try to free it. unique_ptr models unique ownership, so the copy operations are deleted; you transfer ownership with std::move instead.',
    'intermediate',
    2,
    620
  ),
  (
    'cpp.smart_pointers.shared_ptr.lesson',
    'lesson',
    'shared_ptr: shared ownership',
    'A `std::shared_ptr<T>` lets several owners share one object. It keeps a reference count: each new shared_ptr that owns the object increases the count, and each one destroyed decreases it. When the count reaches zero, the object is freed. Create one with `std::make_shared<T>(...)`.',
    'Use shared_ptr only when ownership is genuinely shared. It costs a reference count and atomic updates, so prefer unique_ptr when one owner is enough.',
    'intermediate',
    4,
    630
  ),
  (
    'cpp.smart_pointers.shared_ptr.mc_free',
    'multiple_choice',
    'When shared_ptr frees its object',
    'When does a `std::shared_ptr` free the object it manages?',
    'The object is freed when the last shared_ptr that owns it is destroyed — that is, when the reference count drops to zero.',
    'intermediate',
    2,
    640
  ),
  (
    'cpp.smart_pointers.weak_ptr.code_reading',
    'code_reading',
    'Reading a weak_ptr',
    'Read this code:\n\n```cpp\nstd::shared_ptr<int> sp = std::make_shared<int>(42);\nstd::weak_ptr<int> wp = sp; // observes, does not own\n\nif (auto locked = wp.lock()) {\n  // use *locked\n}\n```\n\nDoes `wp` keep the int alive, and what does `wp.lock()` return?',
    'A weak_ptr observes a shared_ptr without owning it, so `wp` does not keep the int alive. `wp.lock()` returns a shared_ptr to the object if it is still alive, or an empty shared_ptr if it has already been freed.',
    'intermediate',
    3,
    650
  ),
  (
    'cpp.smart_pointers.weak_ptr.mc_count',
    'multiple_choice',
    'weak_ptr and the reference count',
    'What effect does a `std::weak_ptr` have on the shared_ptr reference count?',
    'None. A weak_ptr is a non-owning observer: it does not change the reference count and does not keep the object alive. Call lock() to safely access the object if it still exists.',
    'intermediate',
    2,
    660
  ),
  (
    'cpp.smart_pointers.cyclic_reference.bug_cycle',
    'bug_spotting',
    'Spot the reference cycle',
    'These objects are never freed:\n\n```cpp\nstruct Node { std::shared_ptr<Node> other; };\n\nauto a = std::make_shared<Node>();\nauto b = std::make_shared<Node>();\na->other = b;\nb->other = a;\n```\n\nWhy do `a` and `b` leak?',
    'Each node holds a shared_ptr to the other, so neither reference count can reach zero — a reference cycle. The fix is to make one side a `std::weak_ptr`, which observes without keeping the other alive.',
    'intermediate',
    4,
    670
  ),
  (
    'cpp.smart_pointers.cyclic_reference.mc_break',
    'multiple_choice',
    'Breaking a reference cycle',
    'How do you break a `std::shared_ptr` reference cycle?',
    'Replace one of the shared_ptrs in the cycle with a weak_ptr. The weak_ptr does not contribute to the reference count, so the objects can be freed.',
    'intermediate',
    2,
    680
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
  ('cpp.smart_pointers.unique_ptr.lesson', 'cpp.smart_pointers.unique_ptr', true),
  ('cpp.smart_pointers.unique_ptr.mc_no_copy', 'cpp.smart_pointers.unique_ptr', true),
  ('cpp.smart_pointers.shared_ptr.lesson', 'cpp.smart_pointers.shared_ptr', true),
  ('cpp.smart_pointers.shared_ptr.mc_free', 'cpp.smart_pointers.shared_ptr', true),
  ('cpp.smart_pointers.weak_ptr.code_reading', 'cpp.smart_pointers.weak_ptr', true),
  ('cpp.smart_pointers.weak_ptr.mc_count', 'cpp.smart_pointers.weak_ptr', true),
  ('cpp.smart_pointers.cyclic_reference.bug_cycle', 'cpp.smart_pointers.cyclic_reference', true),
  ('cpp.smart_pointers.cyclic_reference.bug_cycle', 'cpp.smart_pointers.weak_ptr', false),
  ('cpp.smart_pointers.cyclic_reference.mc_break', 'cpp.smart_pointers.cyclic_reference', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.smart_pointers.unique_ptr.mc_no_copy.a', 'cpp.smart_pointers.unique_ptr.mc_no_copy', 'Copying would create two owners of one object, so the copy operations are deleted', true, 10),
  ('cpp.smart_pointers.unique_ptr.mc_no_copy.b', 'cpp.smart_pointers.unique_ptr.mc_no_copy', 'Copying a unique_ptr is simply too slow', false, 20),
  ('cpp.smart_pointers.unique_ptr.mc_no_copy.c', 'cpp.smart_pointers.unique_ptr.mc_no_copy', 'The compiler does not support copying templates', false, 30),
  ('cpp.smart_pointers.unique_ptr.mc_no_copy.d', 'cpp.smart_pointers.unique_ptr.mc_no_copy', 'unique_ptr can be copied freely', false, 40),

  ('cpp.smart_pointers.shared_ptr.mc_free.a', 'cpp.smart_pointers.shared_ptr.mc_free', 'When the last owning shared_ptr is destroyed (reference count reaches zero)', true, 10),
  ('cpp.smart_pointers.shared_ptr.mc_free.b', 'cpp.smart_pointers.shared_ptr.mc_free', 'When the first shared_ptr is destroyed', false, 20),
  ('cpp.smart_pointers.shared_ptr.mc_free.c', 'cpp.smart_pointers.shared_ptr.mc_free', 'Immediately after it is created', false, 30),
  ('cpp.smart_pointers.shared_ptr.mc_free.d', 'cpp.smart_pointers.shared_ptr.mc_free', 'Never — you must call delete yourself', false, 40),

  ('cpp.smart_pointers.weak_ptr.mc_count.a', 'cpp.smart_pointers.weak_ptr.mc_count', 'None — it observes without owning and does not keep the object alive', true, 10),
  ('cpp.smart_pointers.weak_ptr.mc_count.b', 'cpp.smart_pointers.weak_ptr.mc_count', 'It increases the reference count like a shared_ptr', false, 20),
  ('cpp.smart_pointers.weak_ptr.mc_count.c', 'cpp.smart_pointers.weak_ptr.mc_count', 'It decreases the reference count', false, 30),
  ('cpp.smart_pointers.weak_ptr.mc_count.d', 'cpp.smart_pointers.weak_ptr.mc_count', 'It frees the object immediately', false, 40),

  ('cpp.smart_pointers.cyclic_reference.mc_break.a', 'cpp.smart_pointers.cyclic_reference.mc_break', 'Make one of the pointers in the cycle a weak_ptr', true, 10),
  ('cpp.smart_pointers.cyclic_reference.mc_break.b', 'cpp.smart_pointers.cyclic_reference.mc_break', 'Call delete on both objects', false, 20),
  ('cpp.smart_pointers.cyclic_reference.mc_break.c', 'cpp.smart_pointers.cyclic_reference.mc_break', 'Use make_unique instead of make_shared', false, 30),
  ('cpp.smart_pointers.cyclic_reference.mc_break.d', 'cpp.smart_pointers.cyclic_reference.mc_break', 'Increase the reference count by hand', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
