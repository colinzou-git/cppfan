-- Roadmap #80 / #121 final utilities coverage: std::any caution, stream-state
-- tracing, and file-stream RAII lifetime. Idempotent; mirrored in
-- src/features/skills/skill-seed.ts and src/features/learning-items/learning-item-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.utilities.any_caution',
    'cpp',
    'cpp.utilities',
    'std::any as an advanced escape hatch',
    'Understand when std::any is appropriate and why typed alternatives are usually safer.',
    'Use std::any only for truly open, type-erased storage and prefer optional, variant, templates, or polymorphism when the shape is known.',
    'advanced',
    array['lesson', 'quiz'],
    773
  )
on conflict (id) do update
set
  domain = excluded.domain,
  module_id = excluded.module_id,
  title = excluded.title,
  description = excluded.description,
  learner_goal = excluded.learner_goal,
  level = excluded.level,
  item_types = excluded.item_types,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.skill_prerequisites (skill_id, prerequisite_skill_id, relationship_type)
values
  ('cpp.utilities.any_caution', 'cpp.utilities.variant_visit', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.utilities.file_io.code_raii_close',
    'code_reading',
    'Trace file-stream lifetime',
    $prompt$A function creates `std::ofstream out(path);`, writes a report, checks `if (!out) return false;`, and then returns without calling `out.close()`. Why is the file still closed safely, and when would you call `close()` explicitly?$prompt$,
    $explanation$File streams own their file handle and close it in the destructor, so leaving scope closes the file even on early return or exception. Call close() explicitly only when you need to observe close/flush errors or reopen/remove the file before the stream object goes out of scope.$explanation$,
    'intermediate',
    3,
    2625,
    true
  ),
  (
    'cpp.utilities.stream_validation.code_state_trace',
    'code_reading',
    'Trace failed formatted extraction',
    $prompt$`std::istringstream in("abc\n42\n"); int n = 0; in >> n; in >> n;` leaves n unchanged both times. What stream state and buffered input explain this, and what recovery steps make the next line readable?$prompt$,
    $explanation$The first extraction cannot parse an int, sets failbit, leaves n unchanged, and leaves `abc` buffered. The second extraction sees failbit and does nothing. Recover with clear() to reset flags, ignore(...) through the newline to discard the bad record, then read the next line/token.$explanation$,
    'intermediate',
    3,
    4005,
    true
  ),
  (
    'cpp.utilities.any_caution.lesson',
    'lesson',
    'std::any as an advanced escape hatch',
    $prompt$`std::any` can hold one value of almost any copyable type, but it gives up the compile-time knowledge that makes C++ safe and expressive. You read it with `std::any_cast<T>`, which throws `std::bad_any_cast` (or returns null for the pointer form) if the stored type is not T. That makes any useful for truly open plugin metadata, heterogeneous property bags, or boundaries where the set of types is not known to the library author. It is not the first choice for normal program state: use `std::optional<T>` when a value may be absent, `std::variant<A, B>` when the alternatives are a known closed set, templates when the operation is generic but type-preserving, and polymorphism when callers can add new behavior through a stable interface. Rule: reach for any only when type erasure is the requirement, not because designing the type feels inconvenient.$prompt$,
    $explanation$std::any is type-erased storage read with any_cast, so mistakes move from compile time to runtime. Prefer optional for absence, variant for a closed known set, templates for generic typed code, and polymorphism for open behavior. Use any only when truly open heterogeneous storage is required.$explanation$,
    'advanced',
    5,
    4465,
    true
  ),
  (
    'cpp.utilities.any_caution.mc_choice',
    'multiple_choice',
    'When std::any is the right tool',
    $prompt$Which situation is the best fit for std::any rather than optional, variant, templates, or virtual polymorphism?$prompt$,
    $explanation$A plugin metadata bag has an open set of value types that the core library cannot enumerate. That is genuine type-erased storage. A known set of alternatives is better as variant; absence is optional; open behavior is usually polymorphism.$explanation$,
    'advanced',
    2,
    4466,
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
  ('cpp.utilities.file_io.code_raii_close', 'cpp.utilities.file_io', true),
  ('cpp.utilities.stream_validation.code_state_trace', 'cpp.utilities.stream_validation', true),
  ('cpp.utilities.any_caution.lesson', 'cpp.utilities.any_caution', true),
  ('cpp.utilities.any_caution.mc_choice', 'cpp.utilities.any_caution', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.utilities.any_caution.mc_choice.a', 'cpp.utilities.any_caution.mc_choice', 'A plugin metadata bag whose value types are open-ended and not known by the core library', true, 10),
  ('cpp.utilities.any_caution.mc_choice.b', 'cpp.utilities.any_caution.mc_choice', 'A function that may or may not return one int', false, 20),
  ('cpp.utilities.any_caution.mc_choice.c', 'cpp.utilities.any_caution.mc_choice', 'A token that is known to be either an int, string, or bool', false, 30),
  ('cpp.utilities.any_caution.mc_choice.d', 'cpp.utilities.any_caution.mc_choice', 'A family of shapes that share a draw() interface', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
