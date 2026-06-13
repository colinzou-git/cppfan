-- Learning content for the value-semantics skills (#69). Two items per skill;
-- idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.value_semantics.copy.lesson',
    'lesson',
    'Copy semantics',
    'Copying an object makes an independent duplicate. The copy constructor `T(const T&)` and copy assignment `operator=(const T&)` define how. By default the compiler copies each member, which is fine for values but wrong when the class holds a raw owning pointer: a member-wise (shallow) copy leaves two objects pointing at the same resource, so both try to free it. A deep copy duplicates the owned resource instead.',
    'Default copies are member-wise. For a class that owns a raw resource you must implement a deep copy (or, better, use a member that copies correctly on its own).',
    'intermediate',
    4,
    145
  ),
  (
    'cpp.value_semantics.copy.mc_shallow',
    'multiple_choice',
    'Danger of a shallow copy',
    'A class stores a raw owning `T* p` and uses the default copy. What goes wrong when an object is copied?',
    'The default member-wise copy duplicates the pointer value, so both objects point at the same T and each destructor deletes it — a double free.',
    'intermediate',
    2,
    146
  ),
  (
    'cpp.value_semantics.move.lesson',
    'lesson',
    'Move semantics',
    'Moving transfers resources from an expendable source instead of copying them. The move constructor `T(T&&)` and move assignment take an rvalue reference and steal the source''s internals (for example, take its pointer and null the source), leaving it valid but empty. `std::move` casts an lvalue to an rvalue so it can be moved from. Moving a unique_ptr or a large vector avoids a deep copy.',
    'A move leaves the source in a valid but unspecified (usually empty) state. Use std::move to hand off ownership when you no longer need the source.',
    'intermediate',
    4,
    147
  ),
  (
    'cpp.value_semantics.move.mc_source',
    'multiple_choice',
    'State of a moved-from object',
    'What does a correct move constructor do with the source object?',
    'It transfers (steals) the source''s resources and leaves the source valid but empty, so destroying it later is safe.',
    'intermediate',
    2,
    148
  ),
  (
    'cpp.value_semantics.rule_of_zero_five.lesson',
    'lesson',
    'Rule of Zero and Rule of Five',
    'Rule of Zero: design classes so their members manage their own resources (use `std::vector`, `std::string`, `std::unique_ptr`), so you need no custom destructor, copy, or move — the compiler-generated ones are correct. Rule of Five: if you must write any one of the five special members (destructor, copy constructor, copy assignment, move constructor, move assignment), you almost always need to consider all five, because the defaults will then be wrong.',
    'Prefer Rule of Zero. Only reach for the Rule of Five when a class directly manages a raw resource, which is rare in modern C++.',
    'intermediate',
    4,
    149
  ),
  (
    'cpp.value_semantics.rule_of_zero_five.mc_zero',
    'multiple_choice',
    'What the Rule of Zero recommends',
    'What does the Rule of Zero recommend?',
    'Design classes from members that manage their own resources, so the class needs no custom copy/move/destructor and the compiler defaults are correct.',
    'intermediate',
    2,
    150
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
  ('cpp.value_semantics.copy.lesson', 'cpp.value_semantics.copy', true),
  ('cpp.value_semantics.copy.mc_shallow', 'cpp.value_semantics.copy', true),
  ('cpp.value_semantics.move.lesson', 'cpp.value_semantics.move', true),
  ('cpp.value_semantics.move.mc_source', 'cpp.value_semantics.move', true),
  ('cpp.value_semantics.rule_of_zero_five.lesson', 'cpp.value_semantics.rule_of_zero_five', true),
  ('cpp.value_semantics.rule_of_zero_five.mc_zero', 'cpp.value_semantics.rule_of_zero_five', true),
  ('cpp.value_semantics.move.lesson', 'cpp.smart_pointers.ownership_transfer', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.value_semantics.copy.mc_shallow.a', 'cpp.value_semantics.copy.mc_shallow', 'Both objects point at the same T and each frees it (double free)', true, 10),
  ('cpp.value_semantics.copy.mc_shallow.b', 'cpp.value_semantics.copy.mc_shallow', 'The copy is automatically deep', false, 20),
  ('cpp.value_semantics.copy.mc_shallow.c', 'cpp.value_semantics.copy.mc_shallow', 'The program fails to compile', false, 30),
  ('cpp.value_semantics.copy.mc_shallow.d', 'cpp.value_semantics.copy.mc_shallow', 'The pointer becomes null in both', false, 40),

  ('cpp.value_semantics.move.mc_source.a', 'cpp.value_semantics.move.mc_source', 'Steals its resources, leaving it valid but empty', true, 10),
  ('cpp.value_semantics.move.mc_source.b', 'cpp.value_semantics.move.mc_source', 'Makes a full deep copy of it', false, 20),
  ('cpp.value_semantics.move.mc_source.c', 'cpp.value_semantics.move.mc_source', 'Immediately destroys it', false, 30),
  ('cpp.value_semantics.move.mc_source.d', 'cpp.value_semantics.move.mc_source', 'Leaves it unchanged', false, 40),

  ('cpp.value_semantics.rule_of_zero_five.mc_zero.a', 'cpp.value_semantics.rule_of_zero_five.mc_zero', 'Use self-managing members so no custom copy/move/destructor is needed', true, 10),
  ('cpp.value_semantics.rule_of_zero_five.mc_zero.b', 'cpp.value_semantics.rule_of_zero_five.mc_zero', 'Always write all five special members', false, 20),
  ('cpp.value_semantics.rule_of_zero_five.mc_zero.c', 'cpp.value_semantics.rule_of_zero_five.mc_zero', 'Never use destructors', false, 30),
  ('cpp.value_semantics.rule_of_zero_five.mc_zero.d', 'cpp.value_semantics.rule_of_zero_five.mc_zero', 'Make every member public', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
