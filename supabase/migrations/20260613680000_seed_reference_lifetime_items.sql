-- Roadmap #67 / #109 (references follow-up): learning items for lvalue/rvalue,
-- return semantics, and dangling references / lifetimes.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.references.lvalue_rvalue.lesson',
    'lesson',
    'Lvalues and rvalues',
    'Every expression is either an lvalue or an rvalue. An lvalue names a persistent object you can take the address of — a variable like x, or arr[i]. An rvalue is a temporary value with no lasting identity — a literal like 42, or the result of a + b. The distinction drives reference binding: a non-const lvalue reference (int&) binds only to a modifiable lvalue, which is why int& r = 42; is an error but const int& r = 42; is fine (a const lvalue reference may bind to a temporary, extending its lifetime to the reference''s scope). An rvalue reference (int&&) binds to temporaries and is the basis of move semantics. A quick test: if you can assign to it or take its address, it is an lvalue.',
    'Lvalues name persistent, addressable objects; rvalues are temporaries. int& binds only to modifiable lvalues; const int& and int&& can bind to temporaries.',
    'intermediate',
    4,
    2910,
    true
  ),
  (
    'cpp.references.lvalue_rvalue.mc_classify',
    'multiple_choice',
    'Lvalue or rvalue?',
    'In int x = 1; int y = x + 2;, which is an rvalue?',
    'x + 2 is a temporary computed value with no address — an rvalue. x and y are named, addressable objects, so they are lvalues.',
    'intermediate',
    2,
    2920,
    true
  ),
  (
    'cpp.references.return_semantics.lesson',
    'lesson',
    'Return by value vs by reference',
    'Returning by value is the safe default: the caller gets its own copy (and modern compilers elide the copy, so it is cheap). Return by reference only when the referent outlives the call — for example a member function returning a reference to a data member of *this, or operator[] returning a reference into a container that the caller still owns. Returning a reference (or pointer) to a local variable is a bug: the local is destroyed when the function returns, leaving the caller with a dangling reference. So: return by value unless you have a specific, lifetime-safe reason to hand back a reference to storage the caller can rely on.',
    'Return by value by default. Return a reference only to storage that outlives the call (a member, or a container element); never to a local.',
    'intermediate',
    4,
    2930,
    true
  ),
  (
    'cpp.references.return_semantics.mc_local',
    'multiple_choice',
    'Returning a reference to a local',
    'What is wrong with int& f() { int n = 5; return n; }?',
    'n is a local destroyed when f returns, so the returned reference dangles — using it is undefined behavior. Return by value (int f()) instead.',
    'advanced',
    2,
    2940,
    true
  ),
  (
    'cpp.references.dangling.lesson',
    'lesson',
    'Dangling references and lifetimes',
    'A reference is dangling when the object it refers to has been destroyed; reading or writing through it is undefined behavior. The classic cases: returning a reference to a local, keeping a reference to an element of a std::vector across a reallocating push_back, or binding a reference to a temporary that then expires. Binding a const reference to a temporary extends that temporary''s lifetime — but only to the lifetime of the reference, and lifetime extension does not apply across a function return: const std::string& bad() { return std::string("hi"); } still dangles. The fix is almost always to return or store by value, or to ensure the referent''s owner outlives every reference to it.',
    'A dangling reference points at a destroyed object (UB). const& lifetime-extends a temporary only to the reference''s own scope — not across a return; prefer by-value there.',
    'advanced',
    5,
    2950,
    true
  ),
  (
    'cpp.references.dangling.mc_extension',
    'multiple_choice',
    'Limits of lifetime extension',
    'Does const std::string& f() { return std::string("hi"); } return a usable reference?',
    'No — lifetime extension of a temporary by a const reference does not survive the function return, so the returned reference dangles. Return std::string by value instead.',
    'advanced',
    2,
    2960,
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
  ('cpp.references.lvalue_rvalue.lesson', 'cpp.references.lvalue_rvalue', true),
  ('cpp.references.lvalue_rvalue.mc_classify', 'cpp.references.lvalue_rvalue', true),
  ('cpp.references.return_semantics.lesson', 'cpp.references.return_semantics', true),
  ('cpp.references.return_semantics.mc_local', 'cpp.references.return_semantics', true),
  ('cpp.references.dangling.lesson', 'cpp.references.dangling', true),
  ('cpp.references.dangling.mc_extension', 'cpp.references.dangling', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.references.lvalue_rvalue.mc_classify.a', 'cpp.references.lvalue_rvalue.mc_classify', 'x + 2', true, 10),
  ('cpp.references.lvalue_rvalue.mc_classify.b', 'cpp.references.lvalue_rvalue.mc_classify', 'x', false, 20),
  ('cpp.references.lvalue_rvalue.mc_classify.c', 'cpp.references.lvalue_rvalue.mc_classify', 'y', false, 30),
  ('cpp.references.lvalue_rvalue.mc_classify.d', 'cpp.references.lvalue_rvalue.mc_classify', 'The variable named x after assignment', false, 40),
  ('cpp.references.return_semantics.mc_local.a', 'cpp.references.return_semantics.mc_local', 'It returns a reference to a local that is destroyed when f returns (dangling)', true, 10),
  ('cpp.references.return_semantics.mc_local.b', 'cpp.references.return_semantics.mc_local', 'Nothing — it is correct and idiomatic', false, 20),
  ('cpp.references.return_semantics.mc_local.c', 'cpp.references.return_semantics.mc_local', 'It copies the int unnecessarily', false, 30),
  ('cpp.references.return_semantics.mc_local.d', 'cpp.references.return_semantics.mc_local', 'It fails to compile', false, 40),
  ('cpp.references.dangling.mc_extension.a', 'cpp.references.dangling.mc_extension', 'No — lifetime extension does not survive the return, so it dangles', true, 10),
  ('cpp.references.dangling.mc_extension.b', 'cpp.references.dangling.mc_extension', 'Yes — the const reference keeps the temporary alive for the caller', false, 20),
  ('cpp.references.dangling.mc_extension.c', 'cpp.references.dangling.mc_extension', 'Yes — string literals live forever', false, 30),
  ('cpp.references.dangling.mc_extension.d', 'cpp.references.dangling.mc_extension', 'Only if the caller marks the result const', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
