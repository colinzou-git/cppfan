-- Roadmap #67 / #109 (function-interface design): learning items for
-- parameter intent, return-vs-output, optional results, overloads/defaults,
-- and API-choice practice.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.references.interface_intent.lesson',
    'lesson',
    'Reading function-interface intent',
    'A good function signature tells you who owns data, who may mutate it, and what result to expect. Inputs that are small or cheap to copy can be passed by value (int count). Large read-only inputs use const T&, std::span<const T>, or std::string_view. A non-const T& means in-out or output: the caller''s object may change, so use it sparingly and name it clearly. Prefer returning a value for a new result (Stats summarize(...)) instead of filling an output parameter; modern C++ makes returned values cheap through copy elision and moves. Use raw pointers only for non-owning optional observation (const Widget* maybe_parent), never to imply ownership transfer. When a signature mixes return values, refs, pointers, and views, ask: is this input only, output, in-out, optional, or borrowed?',
    'Signatures communicate contracts: value/const&/view for inputs, non-const& for deliberate mutation, pointer for nullable non-owning access, and return values for new results.',
    'intermediate',
    5,
    3450,
    true
  ),
  (
    'cpp.references.interface_intent.mc_result',
    'multiple_choice',
    'Prefer the clearest result channel',
    'Which signature best communicates that a function computes and returns a new Stats value from read-only samples?',
    'Stats summarize(std::span<const Sample>) makes samples read-only borrowed input and returns the new result directly. Output parameters obscure the result channel and are unnecessary here.',
    'intermediate',
    2,
    3460,
    true
  ),
  (
    'cpp.references.interface_intent.bug_ownership',
    'bug_spotting',
    'Spot the misleading ownership signal',
    'What is misleading about this interface?

void render(Widget* widget);

The function only reads a widget, and the widget is required to exist.',
    'A raw pointer suggests nullable observation, and some readers may wonder whether ownership is involved. Since the widget is required and read-only, void render(const Widget& widget); communicates the contract more clearly.',
    'intermediate',
    3,
    3470,
    true
  ),
  (
    'cpp.references.optional_overloads.lesson',
    'lesson',
    'Optional results, overloads, and defaults',
    'std::optional<T> is the right return type when a value may be absent and absence is an expected outcome: std::optional<User> find_user(Id id). It beats magic sentinels like -1 because the type forces the caller to check. For parameters, use a default argument when one value is just a common default (int limit = 10). Use overloads when the caller has genuinely different input shapes, such as load(std::string_view path) and load(std::istream& in). Avoid overload sets that differ only by subtle conversions, and avoid optional output parameters that hide whether the function succeeded. Pair this with views: use std::string_view or std::span<const T> for borrowed input, std::optional<T> for maybe-output, and a clear return type for the main result.',
    'Use optional for expected absence, default arguments for simple default values, and overloads for genuinely different input forms. Keep the main result in the return type.',
    'intermediate',
    5,
    3480,
    true
  ),
  (
    'cpp.references.optional_overloads.mc_find',
    'multiple_choice',
    'Choosing optional for absence',
    'A lookup may or may not find a matching index. Which return type best communicates that expected absence?',
    'std::optional<std::size_t> states that the function either returns an index or no value. It avoids magic sentinels and makes the caller handle the empty case.',
    'intermediate',
    2,
    3490,
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
  ('cpp.references.interface_intent.lesson', 'cpp.references.interface_intent', true),
  ('cpp.references.interface_intent.mc_result', 'cpp.references.interface_intent', true),
  ('cpp.references.interface_intent.bug_ownership', 'cpp.references.interface_intent', true),
  ('cpp.references.optional_overloads.lesson', 'cpp.references.optional_overloads', true),
  ('cpp.references.optional_overloads.mc_find', 'cpp.references.optional_overloads', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.references.interface_intent.mc_result.a', 'cpp.references.interface_intent.mc_result', 'Stats summarize(std::span<const Sample> samples)', true, 10),
  ('cpp.references.interface_intent.mc_result.b', 'cpp.references.interface_intent.mc_result', 'void summarize(std::span<const Sample> samples, Stats& out)', false, 20),
  ('cpp.references.interface_intent.mc_result.c', 'cpp.references.interface_intent.mc_result', 'Stats* summarize(const Sample* samples, int count)', false, 30),
  ('cpp.references.interface_intent.mc_result.d', 'cpp.references.interface_intent.mc_result', 'void summarize(Sample* samples)', false, 40),
  ('cpp.references.optional_overloads.mc_find.a', 'cpp.references.optional_overloads.mc_find', 'std::optional<std::size_t>', true, 10),
  ('cpp.references.optional_overloads.mc_find.b', 'cpp.references.optional_overloads.mc_find', 'std::size_t, returning 0 when missing', false, 20),
  ('cpp.references.optional_overloads.mc_find.c', 'cpp.references.optional_overloads.mc_find', 'bool with an output parameter for the index', false, 30),
  ('cpp.references.optional_overloads.mc_find.d', 'cpp.references.optional_overloads.mc_find', 'A raw pointer to a local index', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
