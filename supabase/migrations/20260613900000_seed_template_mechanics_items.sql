-- Roadmap #70 / #112 (template-mechanics follow-up): learning items for
-- multiple/non-type params, type deduction & instantiation, and aliases/specialization.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.templates.multiple_params.lesson',
    'lesson',
    'Multiple and non-type template parameters',
    'A template can take more than one parameter, and they need not all be types. Multiple type parameters look like template <typename K, typename V> struct Pair { K key; V value; };. A non-type template parameter (NTTP) is a compile-time value rather than a type — most often an integer: template <typename T, std::size_t N> struct Array { T data[N]; }; makes N part of the type, so Array<int, 4> and Array<int, 8> are distinct types with the size baked in at compile time (this is exactly how std::array<T, N> works). NTTPs must be constant expressions known at compile time (integers, enums, pointers/refs to objects with static storage, and in C++20 some literal class types). Use multiple type params when a template relates several types, and an NTTP when a compile-time size or constant should be part of the type.',
    'Templates can take several type params and non-type (value) params like std::size_t N (as in std::array<T, N>). An NTTP must be a compile-time constant and becomes part of the type.',
    'advanced',
    5,
    3570,
    true
  ),
  (
    'cpp.templates.multiple_params.mc_nttp',
    'multiple_choice',
    'What is a non-type template parameter',
    'In template <typename T, std::size_t N> struct Array { T data[N]; };, what is N?',
    'N is a non-type template parameter — a compile-time value (here a size) that becomes part of the type, so Array<int,4> and Array<int,8> are different types. T is the type parameter.',
    'advanced',
    2,
    3580,
    true
  ),
  (
    'cpp.templates.deduction.lesson',
    'lesson',
    'Type deduction and instantiation',
    'When you call a function template, the compiler usually deduces the type arguments from the call: template <typename T> T max(T a, T b); called as max(3, 4) deduces T = int. Deduction has edge cases: max(3, 4.0) fails because the two arguments deduce conflicting T (int vs double) — you must cast or specify max<double>(3, 4.0); and deduction strips top-level references/const, so plain-by-value params deduce the bare type. A template is also only instantiated (code generated) for the specific argument types you actually use, and that instantiation happens where it is used — which is why template definitions must be visible there, i.e. they live in headers rather than a .cpp. (Without that visibility you get linker errors for the missing instantiation.) So: let deduction work, disambiguate conflicting arguments, and keep template definitions header-visible.',
    'The compiler deduces template type args from the call (max(3,4) -> T=int); conflicting args (int vs double) fail to deduce. Templates instantiate per used type at the use site, so definitions must be header-visible.',
    'advanced',
    5,
    3590,
    true
  ),
  (
    'cpp.templates.deduction.mc_headers',
    'multiple_choice',
    'Why templates live in headers',
    'Why are template definitions usually placed in headers rather than a single .cpp file?',
    'A template is instantiated for each type at its point of use, so the full definition must be visible in every translation unit that uses it. Hiding it in one .cpp causes unresolved-symbol linker errors.',
    'advanced',
    2,
    3600,
    true
  ),
  (
    'cpp.templates.aliases_specialization.lesson',
    'lesson',
    'Alias templates and specialization',
    'A type alias names an existing type: using Index = std::size_t;. An alias template parameterizes that: template <typename T> using Vec = std::vector<T>; lets you write Vec<int>, and the standard library uses this for traits shortcuts like std::remove_const_t<T> (an alias for typename std::remove_const<T>::type). Aliases are the modern replacement for typedef and never introduce a new distinct type — just a name. Specialization is different: it provides an alternative implementation of a template for specific arguments. A full specialization like template <> struct Hash<bool> { ... }; customizes behavior for bool only, while the primary template serves everything else; partial specialization customizes a family (e.g. all pointer types T*). Reach for an alias to simplify a type name, and for a specialization when one type genuinely needs different behavior.',
    'Alias templates (template<...> using X = ...;) give a parameterized name for a type (e.g. remove_const_t) and never make a new type. Specialization provides a different implementation for specific template arguments.',
    'advanced',
    5,
    3610,
    true
  ),
  (
    'cpp.templates.aliases_specialization.mc_alias',
    'multiple_choice',
    'What an alias template does',
    'What does template <typename T> using Vec = std::vector<T>; create?',
    'It creates an alias template: Vec<int> is just another name for std::vector<int> — the same type, not a new one. It does not copy or specialize std::vector.',
    'advanced',
    2,
    3620,
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
  ('cpp.templates.multiple_params.lesson', 'cpp.templates.multiple_params', true),
  ('cpp.templates.multiple_params.mc_nttp', 'cpp.templates.multiple_params', true),
  ('cpp.templates.deduction.lesson', 'cpp.templates.deduction', true),
  ('cpp.templates.deduction.mc_headers', 'cpp.templates.deduction', true),
  ('cpp.templates.aliases_specialization.lesson', 'cpp.templates.aliases_specialization', true),
  ('cpp.templates.aliases_specialization.mc_alias', 'cpp.templates.aliases_specialization', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.templates.multiple_params.mc_nttp.a', 'cpp.templates.multiple_params.mc_nttp', 'A non-type template parameter (a compile-time value that becomes part of the type)', true, 10),
  ('cpp.templates.multiple_params.mc_nttp.b', 'cpp.templates.multiple_params.mc_nttp', 'A second type parameter', false, 20),
  ('cpp.templates.multiple_params.mc_nttp.c', 'cpp.templates.multiple_params.mc_nttp', 'A runtime function argument', false, 30),
  ('cpp.templates.multiple_params.mc_nttp.d', 'cpp.templates.multiple_params.mc_nttp', 'A member variable of the struct', false, 40),
  ('cpp.templates.deduction.mc_headers.a', 'cpp.templates.deduction.mc_headers', 'Each use instantiates the template, so its full definition must be visible there', true, 10),
  ('cpp.templates.deduction.mc_headers.b', 'cpp.templates.deduction.mc_headers', 'Headers compile faster than .cpp files', false, 20),
  ('cpp.templates.deduction.mc_headers.c', 'cpp.templates.deduction.mc_headers', 'Templates cannot contain statements', false, 30),
  ('cpp.templates.deduction.mc_headers.d', 'cpp.templates.deduction.mc_headers', 'The linker runs before the compiler', false, 40),
  ('cpp.templates.aliases_specialization.mc_alias.a', 'cpp.templates.aliases_specialization.mc_alias', 'An alias template: Vec<int> is another name for std::vector<int> (same type)', true, 10),
  ('cpp.templates.aliases_specialization.mc_alias.b', 'cpp.templates.aliases_specialization.mc_alias', 'A new container type distinct from std::vector', false, 20),
  ('cpp.templates.aliases_specialization.mc_alias.c', 'cpp.templates.aliases_specialization.mc_alias', 'A specialization of std::vector for int', false, 30),
  ('cpp.templates.aliases_specialization.mc_alias.d', 'cpp.templates.aliases_specialization.mc_alias', 'A runtime copy of the vector', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
