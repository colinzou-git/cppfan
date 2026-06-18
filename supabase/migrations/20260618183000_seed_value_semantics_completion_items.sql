-- Roadmap #69 / #111 finishing slice: Rule-of-Zero refactor,
-- missing-assignment bug spotting, ownership state tracing, and implicit
-- conversion bug spotting.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.value_semantics.rule_of_zero_five.bug_refactor_zero',
    'bug_spotting',
    'Refactor manual ownership to Rule of Zero',
    'This class owns a dynamic array manually:

```cpp
class Scores {
  int* data_;
  std::size_t size_;
public:
  Scores(std::size_t n) : data_(new int[n]{}), size_(n) {}
  ~Scores() { delete[] data_; }
  // copy/move members omitted
};
```

What is the safest modern refactor if Scores should copy like a normal value?',
    'Store std::vector<int> data_; instead of a raw owning pointer and remove the custom destructor/copy/move members. Then the compiler-generated special members copy and move the vector correctly, which is the Rule of Zero.',
    'advanced',
    4,
    3570,
    true
  ),
  (
    'cpp.value_semantics.special_members.bug_missing_assignment',
    'bug_spotting',
    'Missing copy assignment',
    'A class owns a raw pointer, defines a destructor and a deep-copy constructor, but does not define operator=:

```cpp
class Buffer {
  int* p_;
public:
  Buffer(int v) : p_(new int(v)) {}
  ~Buffer() { delete p_; }
  Buffer(const Buffer& other) : p_(new int(*other.p_)) {}
};

Buffer a(1);
Buffer b(2);
b = a;
```

What is the defect?',
    'b = a; uses the compiler-generated copy assignment operator, which copies the pointer value shallowly. Now a and b both own the same int and both destructors delete it. If a class manually owns a resource and defines a destructor/copy constructor, it must also define copy assignment (Rule of Three/Five), or better refactor to Rule of Zero.',
    'advanced',
    4,
    3580,
    true
  ),
  (
    'cpp.value_semantics.special_members.code_state_trace',
    'code_reading',
    'Trace ownership after copy and move',
    'Read this snippet:

```cpp
auto first = std::make_unique<int>(7);
auto second = std::move(first);
auto third = std::make_unique<int>(*second);
*third = 9;
```

Which object owns 7, what is guaranteed about first, and what value does third own?',
    'second owns the original int with value 7. After moving from a std::unique_ptr, first is guaranteed to be empty/null and can be destroyed or assigned to. third owns a separate copied int, then changes its own value to 9; it does not modify second.',
    'advanced',
    3,
    3590,
    true
  ),
  (
    'cpp.value_semantics.operators.bug_implicit_conversion',
    'bug_spotting',
    'Spot the implicit conversion',
    '```cpp
struct Money {
  Money(int cents) : cents(cents) {}
  int cents;
};

void charge(Money amount);
charge(5); // compiles
```

Why can charge(5) compile, and what design change prevents the surprise?',
    'A single-argument constructor is a converting constructor unless it is marked explicit, so the int 5 is implicitly converted to Money. Write explicit Money(int cents) so callers must spell charge(Money{5}), making the API intent clear.',
    'advanced',
    3,
    3600,
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
  ('cpp.value_semantics.rule_of_zero_five.bug_refactor_zero', 'cpp.value_semantics.rule_of_zero_five', true),
  ('cpp.value_semantics.rule_of_zero_five.bug_refactor_zero', 'cpp.value_semantics.deep_copy', false),
  ('cpp.value_semantics.special_members.bug_missing_assignment', 'cpp.value_semantics.special_members', true),
  ('cpp.value_semantics.special_members.bug_missing_assignment', 'cpp.value_semantics.deep_copy', false),
  ('cpp.value_semantics.special_members.code_state_trace', 'cpp.value_semantics.special_members', true),
  ('cpp.value_semantics.special_members.code_state_trace', 'cpp.value_semantics.move', false),
  ('cpp.value_semantics.operators.bug_implicit_conversion', 'cpp.value_semantics.operators', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.value_semantics.operators.bug_implicit_conversion.a', 'cpp.value_semantics.operators.bug_implicit_conversion', 'The single-argument constructor is implicit; mark it explicit', true, 10),
  ('cpp.value_semantics.operators.bug_implicit_conversion.b', 'cpp.value_semantics.operators.bug_implicit_conversion', 'The function charge is overloaded by default; delete the overload', false, 20),
  ('cpp.value_semantics.operators.bug_implicit_conversion.c', 'cpp.value_semantics.operators.bug_implicit_conversion', 'The int is copied into cents by reference; add const', false, 30),
  ('cpp.value_semantics.operators.bug_implicit_conversion.d', 'cpp.value_semantics.operators.bug_implicit_conversion', 'All constructors are explicit automatically in modern C++', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
