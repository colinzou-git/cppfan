-- Learning content for the templates/concepts/ranges skills (#70). Two items
-- per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.templates.function_templates.lesson',
    'lesson',
    'Function templates',
    'A function template lets one definition work for many types. `template <typename T> T maxOf(T a, T b) { return a > b ? a : b; }` works for ints, doubles, and any type with `>`. The compiler deduces `T` from the call arguments and generates a concrete function for each type actually used.',
    'You usually do not write the type explicitly; the compiler deduces T from the arguments. Each distinct T produces its own instantiation.',
    'intermediate',
    4,
    1810
  ),
  (
    'cpp.templates.function_templates.mc_purpose',
    'multiple_choice',
    'What a function template provides',
    'What does writing `template <typename T>` before a function let you do?',
    'It defines one function that works for many types, with T deduced from the call. The compiler instantiates a concrete version per type used.',
    'intermediate',
    2,
    1820
  ),
  (
    'cpp.templates.class_templates.lesson',
    'lesson',
    'Class templates',
    'A class template parameterizes a class by one or more types: `template <typename T> class Box { T value; public: T get() const { return value; } };`, used as `Box<int> b;`. The standard containers (`std::vector<T>`, `std::map<K,V>`) are class templates. Each instantiation (`Box<int>`, `Box<std::string>`) is a separate type.',
    'Class templates are how the standard library provides type-safe containers. You supply the type argument in angle brackets.',
    'intermediate',
    4,
    1830
  ),
  (
    'cpp.templates.class_templates.mc_vector',
    'multiple_choice',
    'Recognizing a class template',
    '`std::vector<int>` is an example of what?',
    '`std::vector` is a class template; `std::vector<int>` is that template instantiated with the type int.',
    'intermediate',
    2,
    1840
  ),
  (
    'cpp.templates.concepts.lesson',
    'lesson',
    'Concepts',
    'A concept (C++20) constrains a template parameter to types that meet stated requirements, e.g. `template <std::integral T> T twice(T x) { return x + x; }` only accepts integer types. Concepts make intent explicit and produce much clearer error messages than unconstrained templates, replacing most older SFINAE tricks.',
    'Concepts say "this template only works for types like X". They turn confusing template errors into a clear "constraint not satisfied" message.',
    'advanced',
    4,
    1850
  ),
  (
    'cpp.templates.concepts.mc_role',
    'multiple_choice',
    'What a concept does',
    'What does applying a concept to a template parameter do?',
    'It constrains the parameter to types that satisfy the concept''s requirements, giving clearer errors and documenting intent.',
    'advanced',
    2,
    1860
  ),
  (
    'cpp.templates.ranges.lesson',
    'lesson',
    'Ranges and views',
    'C++20 ranges let you call algorithms on a whole range without spelling out `begin`/`end`: `std::ranges::sort(v);`. Views compose lazy pipelines: `auto evens = v | std::views::filter([](int x){ return x % 2 == 0; });` produces elements on demand without copying the container.',
    'Range algorithms take the container directly; views are lazy and non-owning, so they compose cheaply.',
    'advanced',
    4,
    1870
  ),
  (
    'cpp.templates.ranges.mc_views',
    'multiple_choice',
    'Advantage of ranges and views',
    'What is an advantage of C++20 ranges and views?',
    'They let you operate on whole ranges directly and compose lazy views that transform/filter without copying the underlying data.',
    'advanced',
    2,
    1880
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
  ('cpp.templates.function_templates.lesson', 'cpp.templates.function_templates', true),
  ('cpp.templates.function_templates.mc_purpose', 'cpp.templates.function_templates', true),
  ('cpp.templates.class_templates.lesson', 'cpp.templates.class_templates', true),
  ('cpp.templates.class_templates.mc_vector', 'cpp.templates.class_templates', true),
  ('cpp.templates.concepts.lesson', 'cpp.templates.concepts', true),
  ('cpp.templates.concepts.mc_role', 'cpp.templates.concepts', true),
  ('cpp.templates.ranges.lesson', 'cpp.templates.ranges', true),
  ('cpp.templates.ranges.mc_views', 'cpp.templates.ranges', true),
  ('cpp.templates.class_templates.mc_vector', 'cpp.stl.vector', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.templates.function_templates.mc_purpose.a', 'cpp.templates.function_templates.mc_purpose', 'Write one function for many types, with T deduced from arguments', true, 10),
  ('cpp.templates.function_templates.mc_purpose.b', 'cpp.templates.function_templates.mc_purpose', 'Make the function run at compile time only', false, 20),
  ('cpp.templates.function_templates.mc_purpose.c', 'cpp.templates.function_templates.mc_purpose', 'Force all callers to pass the type explicitly', false, 30),
  ('cpp.templates.function_templates.mc_purpose.d', 'cpp.templates.function_templates.mc_purpose', 'Hide the function from other files', false, 40),

  ('cpp.templates.class_templates.mc_vector.a', 'cpp.templates.class_templates.mc_vector', 'A class template instantiated with int', true, 10),
  ('cpp.templates.class_templates.mc_vector.b', 'cpp.templates.class_templates.mc_vector', 'A function template', false, 20),
  ('cpp.templates.class_templates.mc_vector.c', 'cpp.templates.class_templates.mc_vector', 'A macro', false, 30),
  ('cpp.templates.class_templates.mc_vector.d', 'cpp.templates.class_templates.mc_vector', 'A concept', false, 40),

  ('cpp.templates.concepts.mc_role.a', 'cpp.templates.concepts.mc_role', 'Constrains the parameter to types meeting a requirement, with clearer errors', true, 10),
  ('cpp.templates.concepts.mc_role.b', 'cpp.templates.concepts.mc_role', 'Makes the template run faster', false, 20),
  ('cpp.templates.concepts.mc_role.c', 'cpp.templates.concepts.mc_role', 'Allows any type with no checking', false, 30),
  ('cpp.templates.concepts.mc_role.d', 'cpp.templates.concepts.mc_role', 'Replaces the need for a return type', false, 40),

  ('cpp.templates.ranges.mc_views.a', 'cpp.templates.ranges.mc_views', 'Operate on whole ranges and compose lazy views without copying', true, 10),
  ('cpp.templates.ranges.mc_views.b', 'cpp.templates.ranges.mc_views', 'They run on the GPU automatically', false, 20),
  ('cpp.templates.ranges.mc_views.c', 'cpp.templates.ranges.mc_views', 'They always copy the container first', false, 30),
  ('cpp.templates.ranges.mc_views.d', 'cpp.templates.ranges.mc_views', 'They remove the need for any includes', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
