-- cppFan curriculum expansion (#16/#22): learning items for the cpp.constructors
-- module. Two items per skill across the four constructor skills, following the
-- structs/classes content style. Idempotent upserts; mirrored in
-- src/features/learning-items/learning-item-seed.ts.
--
-- No schema or item-type changes; content only.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.constructors.default_constructor.lesson',
    'lesson',
    'The default constructor',
    'A default constructor takes no arguments. If you declare no constructors at all, the compiler generates one for you. As soon as you declare any other constructor, that implicit default is no longer generated — you must add it back (for example `Widget() = default;`) if you still want to create objects with no arguments.',
    'The compiler-provided default constructor default-initializes members. Once you write your own constructor, decide explicitly whether a no-argument constructor should still exist.',
    'beginner',
    4,
    410
  ),
  (
    'cpp.constructors.default_constructor.mc_default_needed',
    'multiple_choice',
    'When the default constructor disappears',
    'A class declares only `Widget(int x);` and no other constructors. Is `Widget w;` valid?',
    'Declaring any constructor suppresses the implicit default constructor, so `Widget w;` does not compile unless you also provide a default constructor.',
    'beginner',
    2,
    420
  ),
  (
    'cpp.constructors.parameterized_constructor.code_reading',
    'code_reading',
    'Reading a parameterized constructor',
    'Read this type:\n\n```cpp\nstruct Point {\n  int x;\n  int y;\n  Point(int a, int b) : x(a), y(b) {}\n};\n\nPoint p(3, 4);\n```\n\nWhat are `p.x` and `p.y` after construction?',
    'The parameterized constructor copies the arguments into the members via its initializer list, so `p.x` is 3 and `p.y` is 4.',
    'beginner',
    3,
    430
  ),
  (
    'cpp.constructors.parameterized_constructor.mc_benefit',
    'multiple_choice',
    'Why parameterized constructors',
    'What is the main benefit of a parameterized constructor?',
    'A parameterized constructor lets the caller create an object that starts in a valid, fully specified state, which makes invalid states harder to construct.',
    'beginner',
    2,
    440
  ),
  (
    'cpp.constructors.member_initializer_list.lesson',
    'lesson',
    'Member initializer lists',
    'Prefer initializing members in the constructor''s initializer list (`Widget(int n) : count_(n) {}`) rather than assigning them in the body. The initializer list direct-initializes each member once. It is also required for `const` members, reference members, and members whose type has no default constructor.',
    'Assignment in the constructor body first default-initializes the member and then overwrites it. The initializer list skips that extra step and is mandatory for const/reference members.',
    'beginner',
    4,
    450
  ),
  (
    'cpp.constructors.member_initializer_list.bug_const_member',
    'bug_spotting',
    'Spot the const-member bug',
    'This does not compile:\n\n```cpp\nclass Counter {\n  const int start_;\npublic:\n  Counter(int start) {\n    start_ = start; // error\n  }\n};\n```\n\nWhy is the assignment rejected?',
    'A `const` member must be initialized in the constructor''s initializer list (`Counter(int start) : start_(start) {}`). It cannot be assigned in the body because it is already const by then.',
    'beginner',
    3,
    460
  ),
  (
    'cpp.constructors.destructor_intro.lesson',
    'lesson',
    'Destructors and object lifetime',
    'A destructor `~Type()` runs automatically when an object''s lifetime ends: for a local (stack) object at the end of its enclosing scope, and for a heap object when it is `delete`d. Destructors are where a class releases resources it owns.',
    'Local objects are destroyed in reverse order of construction. You rarely call a destructor directly; the compiler inserts the calls for you.',
    'beginner',
    4,
    470
  ),
  (
    'cpp.constructors.destructor_intro.mc_destruction_order',
    'multiple_choice',
    'Order of destruction',
    'Inside a function, object `a` is constructed and then object `b`. In what order do their destructors run at the end of the scope?',
    'Local objects are destroyed in reverse order of construction, so `b` is destroyed first, then `a`.',
    'beginner',
    2,
    480
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
  ('cpp.constructors.default_constructor.lesson', 'cpp.constructors.default_constructor', true),
  ('cpp.constructors.default_constructor.mc_default_needed', 'cpp.constructors.default_constructor', true),
  ('cpp.constructors.parameterized_constructor.code_reading', 'cpp.constructors.parameterized_constructor', true),
  ('cpp.constructors.parameterized_constructor.mc_benefit', 'cpp.constructors.parameterized_constructor', true),
  ('cpp.constructors.member_initializer_list.lesson', 'cpp.constructors.member_initializer_list', true),
  ('cpp.constructors.member_initializer_list.bug_const_member', 'cpp.constructors.member_initializer_list', true),
  ('cpp.constructors.member_initializer_list.bug_const_member', 'cpp.constructors.default_constructor', false),
  ('cpp.constructors.destructor_intro.lesson', 'cpp.constructors.destructor_intro', true),
  ('cpp.constructors.destructor_intro.mc_destruction_order', 'cpp.constructors.destructor_intro', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.constructors.default_constructor.mc_default_needed.a', 'cpp.constructors.default_constructor.mc_default_needed', 'No — there is no default constructor, so it does not compile', true, 10),
  ('cpp.constructors.default_constructor.mc_default_needed.b', 'cpp.constructors.default_constructor.mc_default_needed', 'Yes — the compiler always provides a default constructor', false, 20),
  ('cpp.constructors.default_constructor.mc_default_needed.c', 'cpp.constructors.default_constructor.mc_default_needed', 'Yes — it calls Widget(int) with x set to 0', false, 30),
  ('cpp.constructors.default_constructor.mc_default_needed.d', 'cpp.constructors.default_constructor.mc_default_needed', 'Only if Widget has no member variables', false, 40),

  ('cpp.constructors.parameterized_constructor.mc_benefit.a', 'cpp.constructors.parameterized_constructor.mc_benefit', 'It lets an object start in a valid, caller-specified state', true, 10),
  ('cpp.constructors.parameterized_constructor.mc_benefit.b', 'cpp.constructors.parameterized_constructor.mc_benefit', 'It makes the class run faster at runtime', false, 20),
  ('cpp.constructors.parameterized_constructor.mc_benefit.c', 'cpp.constructors.parameterized_constructor.mc_benefit', 'It removes the need for member variables', false, 30),
  ('cpp.constructors.parameterized_constructor.mc_benefit.d', 'cpp.constructors.parameterized_constructor.mc_benefit', 'It is required before a class can be copied', false, 40),

  ('cpp.constructors.destructor_intro.mc_destruction_order.a', 'cpp.constructors.destructor_intro.mc_destruction_order', 'b is destroyed first, then a (reverse of construction)', true, 10),
  ('cpp.constructors.destructor_intro.mc_destruction_order.b', 'cpp.constructors.destructor_intro.mc_destruction_order', 'a is destroyed first, then b (same as construction)', false, 20),
  ('cpp.constructors.destructor_intro.mc_destruction_order.c', 'cpp.constructors.destructor_intro.mc_destruction_order', 'Both are destroyed at the same time', false, 30),
  ('cpp.constructors.destructor_intro.mc_destruction_order.d', 'cpp.constructors.destructor_intro.mc_destruction_order', 'The order is unspecified by the language', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
