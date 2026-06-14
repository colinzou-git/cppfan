-- Roadmap #77 / #117 (OOP safety): learning items for object slicing/upcasting,
-- override/final, and owning polymorphic objects.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.oop.slicing.lesson',
    'lesson',
    'Object slicing and upcasting',
    'When you copy a derived object into a base-class *value*, C++ keeps only the base part and discards everything the derived class added — this is object slicing. `Base b = derived;` (or passing `Base b` by value, or `std::vector<Base>`) slices: the derived overrides and extra members are gone, and virtual dispatch reverts to the base version. The fix is to handle polymorphic objects through references or pointers: `Base& r = derived;` or `Base* p = &derived;` keep the full object and dispatch virtually. Upcasting — treating a `Derived` as a `Base&`/`Base*` — is safe and implicit, because every Derived *is* a Base. So the rule is: pass and store polymorphic objects by reference or pointer (`Base&`, `Base*`, smart pointers), never by base value.',
    'Copying a derived object into a base value slices off the derived part and loses virtual dispatch. Use Base&/Base* (upcasting is safe) to keep the whole object and polymorphic behavior.',
    'advanced',
    5,
    2490,
    true
  ),
  (
    'cpp.oop.slicing.mc_slice',
    'multiple_choice',
    'What object slicing does',
    'You have `Derived d;` and write `Base b = d;`. What happens to the derived-specific parts of `d`?',
    'Assigning a derived object to a base *value* copies only the base sub-object — the derived members and overrides are sliced off, so b behaves as a plain Base. Use a Base& or Base* to preserve the full object.',
    'advanced',
    2,
    2500,
    true
  ),
  (
    'cpp.oop.override_final.lesson',
    'lesson',
    'override and final',
    'Writing `override` on a derived function — `void draw() override;` — tells the compiler you intend to override a base virtual function. If the signature does not exactly match a base virtual (a typo, a wrong parameter type, a missing `const`), the compiler errors instead of silently creating a brand-new, unrelated function that never gets called. Without `override`, such mistakes compile and fail mysteriously at runtime, so mark every override. `final` does the opposite: `void draw() final;` stops any further class from overriding this function, and `class Widget final { ... };` stops any class from deriving from Widget. Use `final` to seal a hierarchy where further specialization would be wrong, and to let the compiler devirtualize calls.',
    'override makes the compiler verify the function really overrides a base virtual (catching signature typos); final seals a virtual function or class against further overriding/derivation.',
    'intermediate',
    5,
    2510,
    true
  ),
  (
    'cpp.oop.override_final.mc_override',
    'multiple_choice',
    'What override catches',
    'What does adding `override` to a derived class member function let the compiler do?',
    'override makes the compiler check that the function actually overrides a base virtual with a matching signature; if it does not (e.g. a typo or wrong const), it errors instead of silently creating a new function that is never called.',
    'intermediate',
    2,
    2520,
    true
  ),
  (
    'cpp.oop.polymorphic_ownership.lesson',
    'lesson',
    'Owning polymorphic objects',
    'To own a polymorphic object whose concrete type is chosen at runtime, store it in a `std::unique_ptr<Base>`: `std::unique_ptr<Shape> s = std::make_unique<Circle>(r);`. This keeps the full derived object on the heap, dispatches virtually through the base pointer, and frees it automatically — but only correctly if `Base` has a `virtual` destructor, otherwise `delete` through the base pointer skips the derived destructor and leaks. Use `std::vector<std::unique_ptr<Base>>` for heterogeneous collections, and `std::unique_ptr<Base>` as a factory return type. Code that merely *uses* a polymorphic object should not own it: take a non-owning `Base&` (or `Base*` if it can be null) parameter, e.g. `void render(const Shape& s)`. Reserve `shared_ptr<Base>` for genuinely shared ownership.',
    'Own polymorphic objects via unique_ptr<Base> (requires a virtual destructor) — good for factories and heterogeneous vectors. Functions that only use the object should take a non-owning Base&/Base*.',
    'advanced',
    5,
    2530,
    true
  ),
  (
    'cpp.oop.polymorphic_ownership.mc_unique',
    'multiple_choice',
    'Owning a runtime-chosen type',
    'A factory returns an object whose concrete derived type is decided at runtime, and the caller should own it. What return type fits best?',
    'std::unique_ptr<Base> transfers sole ownership of the heap-allocated derived object, dispatches virtually, and frees it automatically (with a virtual destructor on Base). Returning Base by value would slice it.',
    'advanced',
    2,
    2540,
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
  ('cpp.oop.slicing.lesson', 'cpp.oop.slicing', true),
  ('cpp.oop.slicing.mc_slice', 'cpp.oop.slicing', true),
  ('cpp.oop.override_final.lesson', 'cpp.oop.override_final', true),
  ('cpp.oop.override_final.mc_override', 'cpp.oop.override_final', true),
  ('cpp.oop.polymorphic_ownership.lesson', 'cpp.oop.polymorphic_ownership', true),
  ('cpp.oop.polymorphic_ownership.mc_unique', 'cpp.oop.polymorphic_ownership', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.oop.slicing.mc_slice.a', 'cpp.oop.slicing.mc_slice', 'They are sliced off; b holds only the base part and uses base behavior', true, 10),
  ('cpp.oop.slicing.mc_slice.b', 'cpp.oop.slicing.mc_slice', 'They are preserved, and b dispatches to the derived overrides', false, 20),
  ('cpp.oop.slicing.mc_slice.c', 'cpp.oop.slicing.mc_slice', 'The assignment fails to compile', false, 30),
  ('cpp.oop.slicing.mc_slice.d', 'cpp.oop.slicing.mc_slice', 'b becomes a reference to d', false, 40),
  ('cpp.oop.override_final.mc_override.a', 'cpp.oop.override_final.mc_override', 'Verify the function actually overrides a base virtual, erroring on a signature mismatch', true, 10),
  ('cpp.oop.override_final.mc_override.b', 'cpp.oop.override_final.mc_override', 'Make the function virtual even if the base function is not', false, 20),
  ('cpp.oop.override_final.mc_override.c', 'cpp.oop.override_final.mc_override', 'Prevent any further class from overriding it', false, 30),
  ('cpp.oop.override_final.mc_override.d', 'cpp.oop.override_final.mc_override', 'Generate a default implementation automatically', false, 40),
  ('cpp.oop.polymorphic_ownership.mc_unique.a', 'cpp.oop.polymorphic_ownership.mc_unique', 'std::unique_ptr<Base>', true, 10),
  ('cpp.oop.polymorphic_ownership.mc_unique.b', 'cpp.oop.polymorphic_ownership.mc_unique', 'Base (returned by value)', false, 20),
  ('cpp.oop.polymorphic_ownership.mc_unique.c', 'cpp.oop.polymorphic_ownership.mc_unique', 'Base& (a reference)', false, 30),
  ('cpp.oop.polymorphic_ownership.mc_unique.d', 'cpp.oop.polymorphic_ownership.mc_unique', 'A raw Base* the caller must remember to delete', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
