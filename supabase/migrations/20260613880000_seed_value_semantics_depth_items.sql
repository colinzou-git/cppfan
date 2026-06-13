-- Roadmap #69 / #111 (value-semantics depth): learning items for self-assignment
-- safety, shallow-vs-deep copy (bug spotting), and stream insertion.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.value_semantics.self_assignment.lesson',
    'lesson',
    'Self-assignment safety',
    'A hand-written copy-assignment operator must still work when an object is assigned to itself (a = a;, or aliased through references/pointers). The danger is the classic "release then copy" order: if you delete[] data_; first and then copy from other.data_, a self-assignment has already freed the very buffer you are about to read — use-after-free. Two robust fixes: (1) a self-check guard, if (this == &other) return *this; before doing the work; or, better, (2) the copy-and-swap idiom — take the parameter by value (a copy), then swap your members with it and let the old state be destroyed with the temporary. Copy-and-swap is self-assignment-safe and exception-safe by construction. Best of all, follow the Rule of Zero so members manage themselves and you write no assignment operator at all.',
    'Hand-written operator= must survive a = a. Guard with if (this == &other) return *this;, or use copy-and-swap (by-value param + swap), which is self-assignment- and exception-safe. Better: Rule of Zero.',
    'advanced',
    5,
    3510,
    true
  ),
  (
    'cpp.value_semantics.self_assignment.mc_guard',
    'multiple_choice',
    'Why self-assignment matters',
    'In a hand-written operator= that does delete[] data_; then copies from other, what breaks on a = a;?',
    'this and &other are the same object, so delete[] data_; frees the buffer that is then read from other.data_ — a use-after-free. A self-check or copy-and-swap avoids it.',
    'advanced',
    2,
    3520,
    true
  ),
  (
    'cpp.value_semantics.deep_copy.lesson',
    'lesson',
    'Shallow vs deep copy',
    'When a class owns a resource through a raw pointer, the compiler-generated copy is a shallow copy: it copies the pointer value, so two objects end up owning the same buffer. When both destructors run, the buffer is deleted twice (a double free / crash), and a write through one object is unexpectedly visible through the other. A deep copy allocates a new buffer and copies the contents, giving each object independent state. The modern fix is almost always to stop managing the raw pointer yourself: hold a std::vector/std::string/std::unique_ptr member so the correct copy (or move-only) behavior comes for free (Rule of Zero). Reach for a hand-written deep copy only when you truly must own a raw resource.',
    'A shallow copy duplicates a pointer (two owners -> double free / shared writes). A deep copy duplicates the pointee. Prefer self-managing members (vector/string/unique_ptr) so copies are correct automatically.',
    'advanced',
    5,
    3530,
    true
  ),
  (
    'cpp.value_semantics.deep_copy.bug_double_free',
    'bug_spotting',
    'Spot the shallow-copy bug',
    '```cpp
struct Buffer {
  int* data;
  int size;
  Buffer(int n) : data(new int[n]), size(n) {}
  ~Buffer() { delete[] data; }
  // uses the compiler-generated copy constructor and copy assignment
};

void use() {
  Buffer a(10);
  Buffer b = a;   // <-- what goes wrong here and at scope exit?
}
```
What is the defect, and how would you fix it?',
    'Buffer b = a; uses the implicit copy constructor, which copies the data pointer (shallow), so a.data and b.data point at the same array. At scope exit both destructors run delete[] data on it — a double free (undefined behavior). Fix it by giving Buffer value semantics: store std::vector<int> (Rule of Zero), or write a deep-copy copy constructor and assignment that allocate and copy the elements (and handle self-assignment).',
    'advanced',
    4,
    3540,
    true
  ),
  (
    'cpp.value_semantics.stream_insertion.lesson',
    'lesson',
    'Stream insertion (operator<<)',
    'To make your type printable with std::cout << x, overload the stream-insertion operator as a non-member function: std::ostream& operator<<(std::ostream& os, const T& value) { os << ...; return os; }. It must be a non-member because the left operand is the stream, not your type; take the stream by non-const reference and your value by const&, write the fields to os, and return os so calls can chain (cout << a << b). If it needs private data, declare it a friend of the class. Keep formatting minimal and side-effect-free. The symmetric operator>> reads from an std::istream& the same way.',
    'Overload std::ostream& operator<<(std::ostream& os, const T&) as a non-member, write fields to os, and return os so << chains. Use friend if it needs private members.',
    'intermediate',
    4,
    3550,
    true
  ),
  (
    'cpp.value_semantics.stream_insertion.mc_signature',
    'multiple_choice',
    'operator<< signature',
    'What is the correct signature to make std::cout << p work for a type Point?',
    'std::ostream& operator<<(std::ostream& os, const Point& p) — a non-member taking the stream by reference and the value by const reference, returning the stream so calls chain. A member operator<< would put the stream on the wrong side.',
    'intermediate',
    2,
    3560,
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
  ('cpp.value_semantics.self_assignment.lesson', 'cpp.value_semantics.self_assignment', true),
  ('cpp.value_semantics.self_assignment.mc_guard', 'cpp.value_semantics.self_assignment', true),
  ('cpp.value_semantics.deep_copy.lesson', 'cpp.value_semantics.deep_copy', true),
  ('cpp.value_semantics.deep_copy.bug_double_free', 'cpp.value_semantics.deep_copy', true),
  ('cpp.value_semantics.stream_insertion.lesson', 'cpp.value_semantics.stream_insertion', true),
  ('cpp.value_semantics.stream_insertion.mc_signature', 'cpp.value_semantics.stream_insertion', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.value_semantics.self_assignment.mc_guard.a', 'cpp.value_semantics.self_assignment.mc_guard', 'this and &other are the same object, so the buffer is freed then read (use-after-free)', true, 10),
  ('cpp.value_semantics.self_assignment.mc_guard.b', 'cpp.value_semantics.self_assignment.mc_guard', 'Nothing — self-assignment is always a no-op', false, 20),
  ('cpp.value_semantics.self_assignment.mc_guard.c', 'cpp.value_semantics.self_assignment.mc_guard', 'The compiler rejects a = a at build time', false, 30),
  ('cpp.value_semantics.self_assignment.mc_guard.d', 'cpp.value_semantics.self_assignment.mc_guard', 'It leaks memory but is otherwise correct', false, 40),
  ('cpp.value_semantics.stream_insertion.mc_signature.a', 'cpp.value_semantics.stream_insertion.mc_signature', 'std::ostream& operator<<(std::ostream& os, const Point& p)', true, 10),
  ('cpp.value_semantics.stream_insertion.mc_signature.b', 'cpp.value_semantics.stream_insertion.mc_signature', 'void Point::operator<<(std::ostream& os)', false, 20),
  ('cpp.value_semantics.stream_insertion.mc_signature.c', 'cpp.value_semantics.stream_insertion.mc_signature', 'std::ostream operator<<(Point p, std::ostream os)', false, 30),
  ('cpp.value_semantics.stream_insertion.mc_signature.d', 'cpp.value_semantics.stream_insertion.mc_signature', 'Point operator<<(const Point& p)', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
