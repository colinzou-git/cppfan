-- Roadmap #69 / #111 (value-semantics follow-up): learning items for
-- special-member selection, copy elision, and operator overloading / conversions.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.value_semantics.special_members.lesson',
    'lesson',
    'Which special member runs',
    'Four special members move and copy objects, and construction differs from assignment. T b = a; and T b(a); run the copy constructor (building a new object); b = a; on an existing b runs the copy assignment operator. With an rvalue source, T b = std::move(a); runs the move constructor and b = std::move(a); the move assignment operator. You can ask for the compiler''s version with = default or forbid one with = delete (e.g. delete the copy operations to make a type move-only). After a move, the source object is left in a valid but unspecified state — you may destroy it or assign it a new value, but you must not assume what it holds. Move operations should be marked noexcept so containers like std::vector can move (not copy) elements when they grow.',
    'Construction (T b = a / T b(a)) builds a new object; assignment (b = a) updates an existing one. =default/=delete control the members; a moved-from object is valid but unspecified; mark moves noexcept.',
    'intermediate',
    5,
    3030,
    true
  ),
  (
    'cpp.value_semantics.special_members.mc_which',
    'multiple_choice',
    'Construction or assignment?',
    'Given an already-constructed Widget b;, which special member does b = a; invoke (where a is an lvalue Widget)?',
    'b already exists, so b = a; is assignment, and a is an lvalue, so it is the copy assignment operator. A move would need an rvalue source (e.g. std::move(a)); constructing a new object would run a constructor instead.',
    'intermediate',
    2,
    3040,
    true
  ),
  (
    'cpp.value_semantics.copy_elision.lesson',
    'lesson',
    'Copy elision and return by value',
    'Returning a big object by value is not the performance problem beginners fear. Under copy elision the compiler constructs the returned object directly in the caller''s storage, skipping any copy or move — for a local returned by value this is mandatory in C++17 for a pure prvalue and routine (NRVO) otherwise. So std::string make() that builds and returns a local string does not copy it out. Returning by value also gives the caller a clean, independent object, avoiding the dangling-reference traps of returning a reference to a local. Deep vs shallow still matters for the object''s members: a class holding a pointer needs a deep copy (or, better, a self-managing member) so two copies do not share and double-free the same buffer. Rule of thumb: return by value, and let elision and move semantics make it cheap.',
    'Copy elision builds the returned value directly in the caller, so return-by-value is cheap and safe. Deep copy still matters for pointer-owning members to avoid shared/double-freed buffers.',
    'intermediate',
    5,
    3050,
    true
  ),
  (
    'cpp.value_semantics.copy_elision.mc_return',
    'multiple_choice',
    'Returning a local by value',
    'Why is returning a large local std::string by value usually NOT an expensive copy?',
    'Copy elision (and NRVO) lets the compiler construct the returned string directly in the caller''s storage, eliding the copy/move entirely. Returning by value is both efficient and safe.',
    'intermediate',
    2,
    3060,
    true
  ),
  (
    'cpp.value_semantics.operators.lesson',
    'lesson',
    'Operator overloading and conversions',
    'Overloaded operators should mean what callers expect. operator== must be an equivalence (reflexive, symmetric, transitive) and is usually paired with !=; in C++20 a defaulted operator<=> (the three-way "spaceship") generates the ordering and comparison operators consistently for you. Define operator<<(std::ostream&, const T&) as a non-member to print a type. Be careful with conversions: a single-argument constructor like Money(int) doubles as an implicit conversion, so Money m = 5; silently compiles — often surprising. Mark such constructors explicit unless the implicit conversion is genuinely desirable, and prefer named functions over conversion operators when intent could be ambiguous. The design test is whether a reader can predict an operator''s behavior without reading its body.',
    'Give operators conventional meaning (== as equivalence; C++20 <=> for ordering; non-member << for printing). Mark single-arg constructors explicit to avoid surprising implicit conversions.',
    'advanced',
    5,
    3070,
    true
  ),
  (
    'cpp.value_semantics.operators.mc_explicit',
    'multiple_choice',
    'Avoiding surprising conversions',
    'How do you stop a single-argument constructor Money(int) from allowing the implicit conversion Money m = 5;?',
    'Mark the constructor explicit. Then Money m = 5; no longer compiles, while the intended Money m(5); still works — preventing silent, surprising conversions.',
    'advanced',
    2,
    3080,
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
  ('cpp.value_semantics.special_members.lesson', 'cpp.value_semantics.special_members', true),
  ('cpp.value_semantics.special_members.mc_which', 'cpp.value_semantics.special_members', true),
  ('cpp.value_semantics.copy_elision.lesson', 'cpp.value_semantics.copy_elision', true),
  ('cpp.value_semantics.copy_elision.mc_return', 'cpp.value_semantics.copy_elision', true),
  ('cpp.value_semantics.operators.lesson', 'cpp.value_semantics.operators', true),
  ('cpp.value_semantics.operators.mc_explicit', 'cpp.value_semantics.operators', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.value_semantics.special_members.mc_which.a', 'cpp.value_semantics.special_members.mc_which', 'Copy assignment operator', true, 10),
  ('cpp.value_semantics.special_members.mc_which.b', 'cpp.value_semantics.special_members.mc_which', 'Copy constructor', false, 20),
  ('cpp.value_semantics.special_members.mc_which.c', 'cpp.value_semantics.special_members.mc_which', 'Move constructor', false, 30),
  ('cpp.value_semantics.special_members.mc_which.d', 'cpp.value_semantics.special_members.mc_which', 'Move assignment operator', false, 40),
  ('cpp.value_semantics.copy_elision.mc_return.a', 'cpp.value_semantics.copy_elision.mc_return', 'Copy elision constructs the result directly in the caller, eliding the copy/move', true, 10),
  ('cpp.value_semantics.copy_elision.mc_return.b', 'cpp.value_semantics.copy_elision.mc_return', 'The compiler returns a reference to the local instead', false, 20),
  ('cpp.value_semantics.copy_elision.mc_return.c', 'cpp.value_semantics.copy_elision.mc_return', 'std::string is always stored on the heap and shared', false, 30),
  ('cpp.value_semantics.copy_elision.mc_return.d', 'cpp.value_semantics.copy_elision.mc_return', 'Returning by value is in fact always an expensive copy', false, 40),
  ('cpp.value_semantics.operators.mc_explicit.a', 'cpp.value_semantics.operators.mc_explicit', 'Mark the constructor explicit', true, 10),
  ('cpp.value_semantics.operators.mc_explicit.b', 'cpp.value_semantics.operators.mc_explicit', 'Make the constructor private', false, 20),
  ('cpp.value_semantics.operators.mc_explicit.c', 'cpp.value_semantics.operators.mc_explicit', 'Add a second int parameter', false, 30),
  ('cpp.value_semantics.operators.mc_explicit.d', 'cpp.value_semantics.operators.mc_explicit', 'Mark the constructor const', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
