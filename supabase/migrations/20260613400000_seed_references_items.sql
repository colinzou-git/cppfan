-- Learning content for the references/pointers/const/parameter-passing skills
-- (#67). Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.references.references.lesson',
    'lesson',
    'References as aliases',
    'A reference (`T&`) is another name for an existing object. It must be initialized when declared and cannot later be made to refer to a different object. Passing a parameter by reference lets a function read and modify the caller''s variable without copying it: `void inc(int& n) { ++n; }` changes the argument in place.',
    'A reference is an alias, not a separate object. Because it cannot be null or reseated, it is often safer than a pointer when an object is guaranteed to exist.',
    'beginner',
    4,
    17
  ),
  (
    'cpp.references.references.mc_init',
    'multiple_choice',
    'Declaring a reference',
    'What is required when you declare a reference such as `int& r`?',
    'A reference must be bound to an existing object when it is declared (`int& r = x;`). It cannot be left unbound or reseated later.',
    'beginner',
    2,
    18
  ),
  (
    'cpp.references.pointers.lesson',
    'lesson',
    'Pointers and nullptr',
    'A pointer (`T*`) stores the address of an object, or `nullptr` for "points to nothing". `&x` takes the address of `x`, and `*p` dereferences the pointer to reach the object. Unlike references, a pointer can be null and can be reassigned to point elsewhere. Dereferencing a `nullptr` (or a dangling pointer) is undefined behavior, so check before dereferencing.',
    'Use a pointer when "no object" is a valid state (nullptr) or when you need to repoint it. Always ensure it is non-null before dereferencing.',
    'beginner',
    4,
    19
  ),
  (
    'cpp.references.pointers.mc_null',
    'multiple_choice',
    'Dereferencing nullptr',
    'What happens if you dereference a `nullptr` with `*p`?',
    'Dereferencing a null pointer is undefined behavior — typically a crash. Guard with a null check before dereferencing.',
    'beginner',
    2,
    20
  ),
  (
    'cpp.references.const_correctness.lesson',
    'lesson',
    'Const correctness',
    '`const` marks something that will not be modified. A `const T&` parameter lets a function read a value without copying it and promises not to change it. Marking a member function `const` (`int size() const;`) says it does not modify the object, so it can be called on const objects. Const-correctness documents intent and lets the compiler catch accidental mutation.',
    'Add const wherever you do not intend to modify: parameters, member functions, and local references. It is a compile-time safety net, not a runtime cost.',
    'intermediate',
    4,
    21
  ),
  (
    'cpp.references.const_correctness.mc_constref',
    'multiple_choice',
    'What a const reference parameter allows',
    'What does a `const std::string& s` parameter allow a function to do?',
    'A const reference binds without copying and forbids modification, so the function can read `s` efficiently but cannot change the caller''s string.',
    'intermediate',
    2,
    22
  ),
  (
    'cpp.references.parameter_passing.lesson',
    'lesson',
    'Choosing how to pass parameters',
    'Pass small, cheap-to-copy types (like `int` or `double`) by value. Pass large objects you only read by `const T&` to avoid an expensive copy. Pass by non-const `T&` when the function must modify the caller''s object (an output parameter). Returning by value is fine — the compiler elides or moves the result.',
    'Default to const& for big read-only inputs, value for small inputs, and non-const reference only when you truly need to write back.',
    'intermediate',
    4,
    23
  ),
  (
    'cpp.references.parameter_passing.mc_large',
    'multiple_choice',
    'Passing a large read-only object',
    'How should you pass a large `std::vector<int>` that a function only reads?',
    'By const reference (`const std::vector<int>&`): it avoids copying the whole vector and signals that the function will not modify it.',
    'intermediate',
    2,
    24
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
  ('cpp.references.references.lesson', 'cpp.references.references', true),
  ('cpp.references.references.mc_init', 'cpp.references.references', true),
  ('cpp.references.pointers.lesson', 'cpp.references.pointers', true),
  ('cpp.references.pointers.mc_null', 'cpp.references.pointers', true),
  ('cpp.references.const_correctness.lesson', 'cpp.references.const_correctness', true),
  ('cpp.references.const_correctness.mc_constref', 'cpp.references.const_correctness', true),
  ('cpp.references.parameter_passing.lesson', 'cpp.references.parameter_passing', true),
  ('cpp.references.parameter_passing.mc_large', 'cpp.references.parameter_passing', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.references.references.mc_init.a', 'cpp.references.references.mc_init', 'It must be initialized with an existing object', true, 10),
  ('cpp.references.references.mc_init.b', 'cpp.references.references.mc_init', 'It must be left null until assigned', false, 20),
  ('cpp.references.references.mc_init.c', 'cpp.references.references.mc_init', 'It must be created with new', false, 30),
  ('cpp.references.references.mc_init.d', 'cpp.references.references.mc_init', 'Nothing; references default to 0', false, 40),

  ('cpp.references.pointers.mc_null.a', 'cpp.references.pointers.mc_null', 'Undefined behavior (typically a crash)', true, 10),
  ('cpp.references.pointers.mc_null.b', 'cpp.references.pointers.mc_null', 'It safely returns 0', false, 20),
  ('cpp.references.pointers.mc_null.c', 'cpp.references.pointers.mc_null', 'It returns nullptr', false, 30),
  ('cpp.references.pointers.mc_null.d', 'cpp.references.pointers.mc_null', 'It is always a compile error', false, 40),

  ('cpp.references.const_correctness.mc_constref.a', 'cpp.references.const_correctness.mc_constref', 'Read s without copying, and not modify it', true, 10),
  ('cpp.references.const_correctness.mc_constref.b', 'cpp.references.const_correctness.mc_constref', 'Modify the caller''s string in place', false, 20),
  ('cpp.references.const_correctness.mc_constref.c', 'cpp.references.const_correctness.mc_constref', 'Make a private copy of s', false, 30),
  ('cpp.references.const_correctness.mc_constref.d', 'cpp.references.const_correctness.mc_constref', 'Reseat s to another string', false, 40),

  ('cpp.references.parameter_passing.mc_large.a', 'cpp.references.parameter_passing.mc_large', 'By const reference (const std::vector<int>&)', true, 10),
  ('cpp.references.parameter_passing.mc_large.b', 'cpp.references.parameter_passing.mc_large', 'By value (std::vector<int>)', false, 20),
  ('cpp.references.parameter_passing.mc_large.c', 'cpp.references.parameter_passing.mc_large', 'By non-const reference (std::vector<int>&)', false, 30),
  ('cpp.references.parameter_passing.mc_large.d', 'cpp.references.parameter_passing.mc_large', 'By raw pointer to non-const', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
