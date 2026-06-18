-- Roadmap #66 / #108 (foundations depth): learning items for
-- initialization pitfalls, declarations/definitions, headers, and namespaces.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.values_types.initialization_pitfalls.lesson',
    'lesson',
    'Initialization and const intent',
    'Initialize every object before reading it. int count; leaves count with an indeterminate value, so using it before assignment is a bug; prefer int count{}; or int count = 0;. Braced initialization (int n{value};) also rejects narrowing conversions that would silently lose information. Use const when a value should not change after initialization, constexpr when it must be computable at compile time, and auto when the initializer already makes the type obvious. Those tools work together: initialize first, make non-changing values const, and make compile-time facts constexpr.',
    'Uninitialized reads are bugs; brace initialization catches narrowing. const documents a value that will not change, constexpr requires a compile-time value, and auto should follow a clear initializer.',
    'beginner',
    4,
    3265,
    true
  ),
  (
    'cpp.values_types.initialization_pitfalls.bug_uninitialized',
    'bug_spotting',
    'Spot the uninitialized value',
    'Find the bug:

int total;
for (int x : values) {
  total += x;
}
return total;',
    'total is read by total += x before it has a known value. Initialize it first, for example int total = 0; or int total{};, so the loop accumulates from zero.',
    'beginner',
    3,
    3266,
    true
  ),
  (
    'cpp.functions.declarations_definitions.lesson',
    'lesson',
    'Declarations, definitions, and headers',
    'A declaration tells the compiler a name exists and how to call it: int add(int, int);. A definition supplies the body: int add(int a, int b) { return a + b; }. Code that calls a function must see a declaration before the call, and the whole program must provide exactly one matching non-inline definition or the linker reports an unresolved symbol or duplicate definition. In multi-file programs, put shared function declarations in a header (math_utils.h) and definitions in one source file (math_utils.cpp); other files include the header so the compiler can check calls. Include guards or #pragma once prevent a header from being processed twice in one translation unit.',
    'A declaration is the callable promise; the definition is the body. Headers share declarations, source files hold one definition, and missing/duplicate definitions are link-time errors.',
    'beginner',
    5,
    3390,
    true
  ),
  (
    'cpp.functions.declarations_definitions.code_link_error',
    'code_reading',
    'Predict the link failure',
    'Read this file:

int area(int width, int height);

int main() {
  return area(3, 4);
}

It compiles by itself, but no source file defines area. What stage fails, and why?',
    'The compiler accepts the call because it has a declaration. The linker fails later because it cannot find a matching definition of area(int, int) to connect to the call.',
    'beginner',
    3,
    3400,
    true
  ),
  (
    'cpp.functions.namespaces.lesson',
    'lesson',
    'Namespaces and name collisions',
    'A namespace groups names so they do not collide with the same name elsewhere. geometry::area(rect) and ui::area(window) can coexist because their qualified names differ. Use namespace geometry { ... } around related declarations and call them with geometry::area(...), or bring in a single name with using geometry::area; in a small scope. Avoid using namespace ...; in headers: every file that includes the header inherits that directive, increasing collision risk. Namespaces are especially important when your project grows across many files or links with libraries.',
    'Namespaces make qualified names such as geometry::area distinct from ui::area. Prefer qualification or narrow using-declarations; never put broad using namespace directives in headers.',
    'beginner',
    4,
    3410,
    true
  ),
  (
    'cpp.functions.namespaces.mc_header_using',
    'multiple_choice',
    'Using-directives in headers',
    'Why should a header avoid using namespace std;?',
    'A header is included into other files. A broad using-directive in that header leaks into every including file and can create ambiguous names or collisions far away from the header itself.',
    'beginner',
    2,
    3420,
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
  ('cpp.values_types.initialization_pitfalls.lesson', 'cpp.values_types.initialization_pitfalls', true),
  ('cpp.values_types.initialization_pitfalls.bug_uninitialized', 'cpp.values_types.initialization_pitfalls', true),
  ('cpp.functions.declarations_definitions.lesson', 'cpp.functions.declarations_definitions', true),
  ('cpp.functions.declarations_definitions.code_link_error', 'cpp.functions.declarations_definitions', true),
  ('cpp.functions.namespaces.lesson', 'cpp.functions.namespaces', true),
  ('cpp.functions.namespaces.mc_header_using', 'cpp.functions.namespaces', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.functions.namespaces.mc_header_using.a', 'cpp.functions.namespaces.mc_header_using', 'It leaks the directive into every file that includes the header, increasing name-collision risk', true, 10),
  ('cpp.functions.namespaces.mc_header_using.b', 'cpp.functions.namespaces.mc_header_using', 'It makes the standard library unavailable', false, 20),
  ('cpp.functions.namespaces.mc_header_using.c', 'cpp.functions.namespaces.mc_header_using', 'It prevents the header from compiling more than once', false, 30),
  ('cpp.functions.namespaces.mc_header_using.d', 'cpp.functions.namespaces.mc_header_using', 'It changes functions into inline definitions', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
