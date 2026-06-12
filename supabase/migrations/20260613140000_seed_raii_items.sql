-- cppFan curriculum expansion (#36): learning items for the cpp.raii module.
-- Two items per skill across the four RAII skills, following the established
-- content style. Idempotent upserts; mirrored in
-- src/features/learning-items/learning-item-seed.ts.
--
-- No schema or item-type changes; content only.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.raii.resource_lifetime.lesson',
    'lesson',
    'RAII: tie a resource to an object',
    'RAII stands for Resource Acquisition Is Initialization. The idea: acquire a resource (memory, a file, a lock) in an object''s constructor and release it in that object''s destructor. The resource''s lifetime is then bound to the object''s lifetime, so when the object goes out of scope the cleanup happens automatically.',
    'RAII turns "remember to release this" into "the object releases it for you when it dies". It is the foundation for smart pointers and lock guards.',
    'intermediate',
    4,
    510
  ),
  (
    'cpp.raii.resource_lifetime.mc_ties',
    'multiple_choice',
    'What RAII binds a resource to',
    'Under RAII, a resource''s lifetime is tied to what?',
    'RAII binds the resource to the lifetime of an object: the constructor acquires it and the destructor releases it, so scope exit cleans up automatically.',
    'intermediate',
    2,
    520
  ),
  (
    'cpp.raii.destructor_cleanup.code_reading',
    'code_reading',
    'Reading a RAII wrapper',
    'Read this wrapper:\n\n```cpp\nclass FileHandle {\n  FILE* f_;\npublic:\n  explicit FileHandle(const char* path) : f_(fopen(path, "r")) {}\n  ~FileHandle() { if (f_) fclose(f_); }\n};\n```\n\nWhere and when is the file closed?',
    'The file is closed in the destructor `~FileHandle`, which runs automatically when the `FileHandle` object goes out of scope — no explicit close call is needed at the call site.',
    'intermediate',
    3,
    530
  ),
  (
    'cpp.raii.destructor_cleanup.mc_where',
    'multiple_choice',
    'Where a RAII wrapper releases its resource',
    'In a RAII wrapper that owns a resource, where should the resource be released?',
    'The destructor is the release point: it runs deterministically when the object is destroyed, so the resource is always freed exactly once.',
    'intermediate',
    2,
    540
  ),
  (
    'cpp.raii.exception_safety_intro.concept',
    'concept_check',
    'RAII and early exits',
    'A function acquires a resource, does some work that may throw an exception, and then releases the resource on its last line. Why is RAII safer than this manual approach?',
    'If the work throws, the function never reaches its last line, so the manual release is skipped and the resource leaks. With RAII, the owning object''s destructor runs during stack unwinding, releasing the resource even on the exceptional path.',
    'intermediate',
    3,
    550
  ),
  (
    'cpp.raii.exception_safety_intro.mc_unwind',
    'multiple_choice',
    'Exceptions and local RAII objects',
    'An exception is thrown partway through a function. What happens to the local RAII objects that were already fully constructed?',
    'During stack unwinding, destructors of already-constructed local objects run, so their resources are released even though the function did not finish normally.',
    'intermediate',
    2,
    560
  ),
  (
    'cpp.raii.ownership_boundary.bug_double_free',
    'bug_spotting',
    'Spot the double free',
    'This crashes:\n\n```cpp\nclass Owner {\n  Widget* p_;\npublic:\n  Owner(Widget* p) : p_(p) {}\n  ~Owner() { delete p_; }\n};\n\nOwner a(new Widget());\nOwner b = a; // copies the raw pointer\n```\n\nWhy does this lead to undefined behavior?',
    'The default copy makes `a.p_` and `b.p_` point at the same Widget, so both destructors `delete` it — a double free. A resource should have a single owner; use unique ownership (or delete the copy) so only one object frees it.',
    'intermediate',
    4,
    570
  ),
  (
    'cpp.raii.ownership_boundary.mc_owners',
    'multiple_choice',
    'How many owners a resource should have',
    'In a clear ownership model, how many objects should own (and ultimately free) a given resource?',
    'Exactly one owner should be responsible for releasing the resource. Other code may observe or use it via non-owning references, but must not free it.',
    'intermediate',
    2,
    580
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
  ('cpp.raii.resource_lifetime.lesson', 'cpp.raii.resource_lifetime', true),
  ('cpp.raii.resource_lifetime.mc_ties', 'cpp.raii.resource_lifetime', true),
  ('cpp.raii.destructor_cleanup.code_reading', 'cpp.raii.destructor_cleanup', true),
  ('cpp.raii.destructor_cleanup.mc_where', 'cpp.raii.destructor_cleanup', true),
  ('cpp.raii.destructor_cleanup.code_reading', 'cpp.constructors.destructor_intro', false),
  ('cpp.raii.exception_safety_intro.concept', 'cpp.raii.exception_safety_intro', true),
  ('cpp.raii.exception_safety_intro.mc_unwind', 'cpp.raii.exception_safety_intro', true),
  ('cpp.raii.ownership_boundary.bug_double_free', 'cpp.raii.ownership_boundary', true),
  ('cpp.raii.ownership_boundary.mc_owners', 'cpp.raii.ownership_boundary', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.raii.resource_lifetime.mc_ties.a', 'cpp.raii.resource_lifetime.mc_ties', 'The lifetime of an object (constructor acquires, destructor releases)', true, 10),
  ('cpp.raii.resource_lifetime.mc_ties.b', 'cpp.raii.resource_lifetime.mc_ties', 'The lifetime of the whole program', false, 20),
  ('cpp.raii.resource_lifetime.mc_ties.c', 'cpp.raii.resource_lifetime.mc_ties', 'A manual free() call you must remember', false, 30),
  ('cpp.raii.resource_lifetime.mc_ties.d', 'cpp.raii.resource_lifetime.mc_ties', 'A background garbage collector', false, 40),

  ('cpp.raii.destructor_cleanup.mc_where.a', 'cpp.raii.destructor_cleanup.mc_where', 'In the destructor', true, 10),
  ('cpp.raii.destructor_cleanup.mc_where.b', 'cpp.raii.destructor_cleanup.mc_where', 'In the constructor', false, 20),
  ('cpp.raii.destructor_cleanup.mc_where.c', 'cpp.raii.destructor_cleanup.mc_where', 'In a separate static cleanup function', false, 30),
  ('cpp.raii.destructor_cleanup.mc_where.d', 'cpp.raii.destructor_cleanup.mc_where', 'Nowhere — the operating system frees everything', false, 40),

  ('cpp.raii.exception_safety_intro.mc_unwind.a', 'cpp.raii.exception_safety_intro.mc_unwind', 'Their destructors run during stack unwinding, releasing their resources', true, 10),
  ('cpp.raii.exception_safety_intro.mc_unwind.b', 'cpp.raii.exception_safety_intro.mc_unwind', 'They leak because the function did not finish', false, 20),
  ('cpp.raii.exception_safety_intro.mc_unwind.c', 'cpp.raii.exception_safety_intro.mc_unwind', 'Nothing happens until the program exits', false, 30),
  ('cpp.raii.exception_safety_intro.mc_unwind.d', 'cpp.raii.exception_safety_intro.mc_unwind', 'They are released only if you catch the exception', false, 40),

  ('cpp.raii.ownership_boundary.mc_owners.a', 'cpp.raii.ownership_boundary.mc_owners', 'Exactly one owner; others may observe without freeing', true, 10),
  ('cpp.raii.ownership_boundary.mc_owners.b', 'cpp.raii.ownership_boundary.mc_owners', 'Every object that uses the resource', false, 20),
  ('cpp.raii.ownership_boundary.mc_owners.c', 'cpp.raii.ownership_boundary.mc_owners', 'None — resources free themselves', false, 30),
  ('cpp.raii.ownership_boundary.mc_owners.d', 'cpp.raii.ownership_boundary.mc_owners', 'At least two, for safety', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
