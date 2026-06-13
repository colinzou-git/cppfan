-- Roadmap #65 / #77 (stage 11): learning items for composition, inheritance, polymorphism, interfaces.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.oop.composition.lesson',
    'lesson',
    'Composition',
    'Composition models a "has-a" relationship: a class owns other objects as data members and delegates work to them. A Car has-an Engine and has-a set of Wheels; a Logger member gives a class logging without the class being a logger. Composition is the default reuse mechanism in modern C++ because it keeps coupling loose — you depend on a member''s public interface, not its internals — and it sidesteps the fragility of deep inheritance hierarchies. The guideline "prefer composition over inheritance" means: reach for a member first, and only inherit when there is a genuine is-a relationship plus a need for polymorphism.',
    'Composition is a has-a relationship: hold other objects as members and delegate to them. Prefer it over inheritance for reuse because coupling stays loose.',
    'intermediate',
    5,
    2410,
    true
  ),
  (
    'cpp.oop.composition.mc_relationship',
    'multiple_choice',
    'Composition vs inheritance',
    'Which relationship is best modeled by composition (holding an object as a member)?',
    'Composition expresses "has-a": a Car has-an Engine. "Is-a" relationships (a Car is-a Vehicle) are what inheritance models. Prefer composition unless you genuinely need an is-a relationship with polymorphism.',
    'intermediate',
    2,
    2420,
    true
  ),
  (
    'cpp.oop.inheritance.lesson',
    'lesson',
    'Inheritance',
    'Inheritance models an "is-a" relationship: a derived class extends a base class, inheriting its public and protected members. Writing class Dog : public Animal { ... } means a Dog is-an Animal and can be used wherever an Animal is expected. The derived class adds its own members and can reuse base behavior. Use public inheritance only when the derived type truly is a kind of the base and honors the base''s contract (the Liskov substitution principle). Private/protected inheritance exists but is rare; when you only want to reuse code, composition is usually the better tool.',
    'Public inheritance models is-a: a derived class extends a base and can stand in for it. Use it only when the derived type genuinely is a kind of the base.',
    'intermediate',
    5,
    2430,
    true
  ),
  (
    'cpp.oop.inheritance.mc_access',
    'multiple_choice',
    'What a derived class inherits',
    'With class Dog : public Animal, which members of Animal can Dog''s own methods access directly?',
    'A derived class can access the public and protected members of its base, but not the base''s private members. Private members remain encapsulated within the base class.',
    'intermediate',
    2,
    2440,
    true
  ),
  (
    'cpp.oop.virtual_polymorphism.lesson',
    'lesson',
    'Virtual functions and polymorphism',
    'Runtime polymorphism lets a call through a base pointer or reference run the derived class''s version of a function. Declare the function virtual in the base; the override runs based on the object''s actual type, resolved at run time via the vtable. This is what makes Animal* a = new Dog(); a->speak(); print the dog''s sound. One rule is non-negotiable: a base class meant to be deleted through a base pointer must have a virtual destructor, otherwise delete a; only runs the base destructor and leaks the derived part. Mark overrides with override so the compiler catches signature mistakes.',
    'A virtual function dispatches on the object''s real type at run time. A polymorphic base class needs a virtual destructor, or deleting through a base pointer leaks the derived part.',
    'advanced',
    6,
    2450,
    true
  ),
  (
    'cpp.oop.virtual_polymorphism.mc_destructor',
    'multiple_choice',
    'Why a virtual destructor',
    'Why must a base class deleted through a base-class pointer have a virtual destructor?',
    'Without a virtual destructor, delete basePtr; runs only the base destructor, skipping the derived destructor — leaking the derived part''s resources. A virtual destructor ensures the full chain runs.',
    'advanced',
    2,
    2460,
    true
  ),
  (
    'cpp.oop.abstract_interfaces.lesson',
    'lesson',
    'Abstract classes and interfaces',
    'A pure virtual function — declared virtual void draw() = 0; — has no implementation in the base and makes the class abstract: you cannot instantiate it directly. A class made entirely of pure virtual functions (plus a virtual destructor) acts as an interface: it specifies what derived classes must do without saying how. Concrete derived classes must override every pure virtual function before they can be instantiated. Interfaces let code depend on an abstraction — void render(Shape& s) { s.draw(); } works for any shape — which is the backbone of dependency inversion and testable, swappable designs.',
    'A pure virtual function (= 0) makes a class abstract and cannot be instantiated; a class of only pure virtuals is an interface that derived classes must fully implement.',
    'advanced',
    5,
    2470,
    true
  ),
  (
    'cpp.oop.abstract_interfaces.mc_pure_virtual',
    'multiple_choice',
    'Effect of a pure virtual function',
    'What does declaring virtual void draw() = 0; in a class do?',
    'The = 0 makes draw a pure virtual function, which makes the class abstract: it cannot be instantiated, and any concrete derived class must override draw.',
    'advanced',
    2,
    2480,
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
  ('cpp.oop.composition.lesson', 'cpp.oop.composition', true),
  ('cpp.oop.composition.mc_relationship', 'cpp.oop.composition', true),
  ('cpp.oop.inheritance.lesson', 'cpp.oop.inheritance', true),
  ('cpp.oop.inheritance.mc_access', 'cpp.oop.inheritance', true),
  ('cpp.oop.virtual_polymorphism.lesson', 'cpp.oop.virtual_polymorphism', true),
  ('cpp.oop.virtual_polymorphism.mc_destructor', 'cpp.oop.virtual_polymorphism', true),
  ('cpp.oop.abstract_interfaces.lesson', 'cpp.oop.abstract_interfaces', true),
  ('cpp.oop.abstract_interfaces.mc_pure_virtual', 'cpp.oop.abstract_interfaces', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.oop.composition.mc_relationship.a', 'cpp.oop.composition.mc_relationship', 'A Car has-an Engine', true, 10),
  ('cpp.oop.composition.mc_relationship.b', 'cpp.oop.composition.mc_relationship', 'A Dog is-an Animal', false, 20),
  ('cpp.oop.composition.mc_relationship.c', 'cpp.oop.composition.mc_relationship', 'A Square is-a Shape', false, 30),
  ('cpp.oop.composition.mc_relationship.d', 'cpp.oop.composition.mc_relationship', 'A Manager is-an Employee', false, 40),
  ('cpp.oop.inheritance.mc_access.a', 'cpp.oop.inheritance.mc_access', 'Its public and protected members', true, 10),
  ('cpp.oop.inheritance.mc_access.b', 'cpp.oop.inheritance.mc_access', 'Only its public members', false, 20),
  ('cpp.oop.inheritance.mc_access.c', 'cpp.oop.inheritance.mc_access', 'All members including private ones', false, 30),
  ('cpp.oop.inheritance.mc_access.d', 'cpp.oop.inheritance.mc_access', 'None of them', false, 40),
  ('cpp.oop.virtual_polymorphism.mc_destructor.a', 'cpp.oop.virtual_polymorphism.mc_destructor', 'Otherwise deleting through the base pointer skips the derived destructor and leaks', true, 10),
  ('cpp.oop.virtual_polymorphism.mc_destructor.b', 'cpp.oop.virtual_polymorphism.mc_destructor', 'Otherwise the class cannot have any members', false, 20),
  ('cpp.oop.virtual_polymorphism.mc_destructor.c', 'cpp.oop.virtual_polymorphism.mc_destructor', 'Because constructors must also be virtual', false, 30),
  ('cpp.oop.virtual_polymorphism.mc_destructor.d', 'cpp.oop.virtual_polymorphism.mc_destructor', 'It makes the class smaller in memory', false, 40),
  ('cpp.oop.abstract_interfaces.mc_pure_virtual.a', 'cpp.oop.abstract_interfaces.mc_pure_virtual', 'It makes the class abstract so it cannot be instantiated and must be overridden', true, 10),
  ('cpp.oop.abstract_interfaces.mc_pure_virtual.b', 'cpp.oop.abstract_interfaces.mc_pure_virtual', 'It gives draw a default empty body', false, 20),
  ('cpp.oop.abstract_interfaces.mc_pure_virtual.c', 'cpp.oop.abstract_interfaces.mc_pure_virtual', 'It deletes the draw function', false, 30),
  ('cpp.oop.abstract_interfaces.mc_pure_virtual.d', 'cpp.oop.abstract_interfaces.mc_pure_virtual', 'It makes draw a static function', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
