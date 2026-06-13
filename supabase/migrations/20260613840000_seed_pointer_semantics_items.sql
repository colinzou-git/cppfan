-- Roadmap #67 / #109 (pointer-semantics follow-up): learning items for
-- pointer-to-const vs const pointer, non-owning pointers + selection, and views.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.references.pointer_const.lesson',
    'lesson',
    'Pointer-to-const vs const pointer',
    'const on a pointer can lock the data, the pointer, or both — read it right-to-left around the *. const int* p (same as int const* p) is a pointer to const: you may repoint p, but you cannot modify *p through it. int* const p is a const pointer: you may modify *p, but p must always point at the same object. const int* const p locks both. The common case for parameters is pointer-to-const (const T*), which says "I will read what you point at, not change it," mirroring const T&. A quick trick: whatever is immediately left of const is what is constant (or the thing to its right if const is leftmost).',
    'Read const around the *: const int* = pointer to const (data locked, pointer movable); int* const = const pointer (pointer fixed, data writable); const int* const locks both.',
    'intermediate',
    4,
    3390,
    true
  ),
  (
    'cpp.references.pointer_const.mc_which',
    'multiple_choice',
    'What is const here?',
    'Given const int* p;, what does const apply to?',
    'const int* p is a pointer to const int: the pointed-to value cannot be changed through p, but p itself can be reassigned to point elsewhere. (A const pointer would be int* const p.)',
    'intermediate',
    2,
    3400,
    true
  ),
  (
    'cpp.references.non_owning.lesson',
    'lesson',
    'Non-owning pointers and selection',
    'A raw pointer in modern C++ should mean "I observe this object but do not own it" — ownership belongs to a value, a container, or a smart pointer (unique_ptr/shared_ptr). A non-owning raw pointer must never be deleted by the observer and must not outlive what it points at. Choosing between a reference and a pointer comes down to nullability and rebinding: use a reference (T&/const T&) when the thing is always present and fixed, and a pointer (T*) when it may be absent (nullptr) or needs to be repointed. So an optional, observe-only parameter is const T*; a required one is const T&. Document the contract — a T* parameter that can be null should check for null before dereferencing.',
    'Raw pointers = non-owning observers (never delete, do not outlive the target). Pick a reference when always-present and fixed; a pointer when it can be null or must be repointed.',
    'intermediate',
    5,
    3410,
    true
  ),
  (
    'cpp.references.non_owning.mc_select',
    'multiple_choice',
    'Reference or pointer?',
    'A function parameter refers to an object that is always present and never repointed. What should it be?',
    'A reference (T& / const T&): it cannot be null and always binds the same object, expressing "always present" directly. Use a pointer only when the argument can be absent (nullable) or needs to be repointed.',
    'intermediate',
    2,
    3420,
    true
  ),
  (
    'cpp.references.views.lesson',
    'lesson',
    'Non-owning views: span and string_view',
    'A view borrows a contiguous range without owning it. std::span<T> is a non-owning (pointer, length) pair over an array, std::vector, or C array; std::string_view is the same for character data. Taking std::span<const int> or std::string_view as a parameter replaces the error-prone (const T* ptr, size_t len) idiom and raw pointer arithmetic with a bounds-aware object you can range-for, .size(), and .subspan()/.substr() safely. The one rule: a view does NOT extend the lifetime of what it points at, so never return a view to a local and never keep a string_view to a temporary string — that dangles just like a raw pointer. Use views for read-only/borrowing parameters; use owning types (std::string, std::vector) for storage.',
    'std::span / std::string_view are non-owning (pointer+length) views that replace raw pointer+length APIs and arithmetic with bounds-aware borrowing. They do not extend lifetime — never return or store a view of a temporary/local.',
    'advanced',
    5,
    3430,
    true
  ),
  (
    'cpp.references.views.mc_use',
    'multiple_choice',
    'Choosing a view parameter',
    'What is the idiomatic modern C++ way for a function to read a sequence of characters it does not own?',
    'Take a std::string_view: a non-owning, bounds-aware view that accepts std::string, string literals, and substrings without copying — replacing the (const char*, size_t) pair. Just do not store it beyond the argument lifetime.',
    'advanced',
    2,
    3440,
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
  ('cpp.references.pointer_const.lesson', 'cpp.references.pointer_const', true),
  ('cpp.references.pointer_const.mc_which', 'cpp.references.pointer_const', true),
  ('cpp.references.non_owning.lesson', 'cpp.references.non_owning', true),
  ('cpp.references.non_owning.mc_select', 'cpp.references.non_owning', true),
  ('cpp.references.views.lesson', 'cpp.references.views', true),
  ('cpp.references.views.mc_use', 'cpp.references.views', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.references.pointer_const.mc_which.a', 'cpp.references.pointer_const.mc_which', 'The pointed-to int (it cannot be changed through p), but p can be reassigned', true, 10),
  ('cpp.references.pointer_const.mc_which.b', 'cpp.references.pointer_const.mc_which', 'The pointer p itself (it cannot be reassigned)', false, 20),
  ('cpp.references.pointer_const.mc_which.c', 'cpp.references.pointer_const.mc_which', 'Both the pointer and the pointee', false, 30),
  ('cpp.references.pointer_const.mc_which.d', 'cpp.references.pointer_const.mc_which', 'Nothing; const is ignored on pointers', false, 40),
  ('cpp.references.non_owning.mc_select.a', 'cpp.references.non_owning.mc_select', 'A reference (T& / const T&)', true, 10),
  ('cpp.references.non_owning.mc_select.b', 'cpp.references.non_owning.mc_select', 'A raw pointer so it can be null', false, 20),
  ('cpp.references.non_owning.mc_select.c', 'cpp.references.non_owning.mc_select', 'A std::shared_ptr to share ownership', false, 30),
  ('cpp.references.non_owning.mc_select.d', 'cpp.references.non_owning.mc_select', 'A std::unique_ptr passed by value', false, 40),
  ('cpp.references.views.mc_use.a', 'cpp.references.views.mc_use', 'Take a std::string_view', true, 10),
  ('cpp.references.views.mc_use.b', 'cpp.references.views.mc_use', 'Take a const char* and a separate length', false, 20),
  ('cpp.references.views.mc_use.c', 'cpp.references.views.mc_use', 'Take a std::string by value (copy it)', false, 30),
  ('cpp.references.views.mc_use.d', 'cpp.references.views.mc_use', 'Take a char* and use pointer arithmetic', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
