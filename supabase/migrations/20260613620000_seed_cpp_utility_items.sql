-- Roadmap #65 / #80 (stage 13): learning items for file I/O, filesystem, chrono, random, variant.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.utilities.file_io.lesson',
    'lesson',
    'File I/O and filesystem',
    'C++ file streams mirror console I/O: std::ofstream out("data.txt"); opens a file for writing and you use out << value; just like std::cout; std::ifstream in("data.txt"); reads with in >> value or std::getline. Always check the stream is open and good before trusting reads. Files close automatically when the stream object is destroyed (RAII). For paths and metadata, std::filesystem (since C++17) provides fs::path, fs::exists(p), fs::create_directory(p), and iteration over directory entries — portable across operating systems so you avoid hand-built path strings.',
    'ofstream/ifstream do file I/O with the same << / >> as console streams and close via RAII; std::filesystem gives portable path, existence, and directory operations.',
    'intermediate',
    5,
    2610,
    true
  ),
  (
    'cpp.utilities.file_io.mc_exists',
    'multiple_choice',
    'Checking a file exists',
    'Which standard facility portably checks whether a file or directory exists?',
    'std::filesystem::exists(path) reports whether a path exists, portably across operating systems. It replaces ad-hoc tricks like trying to open the file just to test for it.',
    'intermediate',
    2,
    2620,
    true
  ),
  (
    'cpp.utilities.chrono.lesson',
    'lesson',
    'Time with chrono',
    'std::chrono represents time with strong types instead of bare numbers. A duration is a span (e.g. std::chrono::milliseconds(5)); a time_point is a moment read from a clock. To measure elapsed time, capture auto start = std::chrono::steady_clock::now();, run the work, then subtract: auto elapsed = std::chrono::steady_clock::now() - start; and convert with std::chrono::duration_cast<std::chrono::milliseconds>(elapsed).count(). Use steady_clock for measuring intervals (it never jumps backward), and system_clock only for wall-clock calendar time. The type system prevents accidentally mixing seconds with milliseconds.',
    'Use steady_clock::now() before and after a block and subtract to get a duration; duration_cast converts it to the units you want. steady_clock is the right clock for measuring intervals.',
    'intermediate',
    5,
    2630,
    true
  ),
  (
    'cpp.utilities.chrono.mc_clock',
    'multiple_choice',
    'Which clock for timing',
    'Which chrono clock is the right choice for measuring how long a code block takes?',
    'steady_clock is monotonic — it never jumps backward when the system time is adjusted — so it is the correct clock for measuring elapsed intervals. system_clock can shift and is for calendar time.',
    'intermediate',
    2,
    2640,
    true
  ),
  (
    'cpp.utilities.random.lesson',
    'lesson',
    'Random numbers',
    'Modern C++ separates the source of randomness from how it is shaped. A random engine such as std::mt19937 produces raw random bits; a distribution such as std::uniform_int_distribution<int> dist(1, 6) maps those bits to the range and shape you want. You seed the engine once (often from std::random_device) and then call dist(engine) to draw values. This beats the old rand() % n idiom, which has modulo bias (some outcomes are slightly more likely) and a low-quality generator. For a fair die roll, uniform_int_distribution(1, 6) is correct and unbiased.',
    'Pair a random engine (e.g. mt19937) with a distribution (e.g. uniform_int_distribution) for unbiased values; this replaces the biased rand() % n idiom.',
    'intermediate',
    5,
    2650,
    true
  ),
  (
    'cpp.utilities.random.mc_bias',
    'multiple_choice',
    'Avoiding modulo bias',
    'What is the recommended way to generate an unbiased random integer in a range like 1 to 6?',
    'Use a random engine with std::uniform_int_distribution<int>(1, 6). The classic rand() % 6 + 1 introduces modulo bias and relies on a weaker generator.',
    'intermediate',
    2,
    2660,
    true
  ),
  (
    'cpp.utilities.variant.lesson',
    'lesson',
    'Variant and optional',
    'std::optional<T> models a value that might be absent: it either holds a T or nothing, replacing sentinel values like -1 or null pointers. Check it with if (opt) and read it with *opt or opt.value(). std::variant<A, B, C> is a type-safe union that holds exactly one of several alternative types at a time; you query the active type and access it safely with std::visit or std::get_if. Together they let you express "maybe a value" and "one of these types" without unsafe casts or out-of-band flags, with the compiler enforcing that you handle the cases.',
    'std::optional<T> represents a maybe-present value (no sentinels); std::variant holds exactly one of several types and is accessed safely with std::visit/std::get_if.',
    'advanced',
    5,
    2670,
    true
  ),
  (
    'cpp.utilities.variant.mc_optional',
    'multiple_choice',
    'Representing a maybe-value',
    'What is std::optional<int> best used for?',
    'std::optional<int> represents an int that may or may not be present, replacing magic sentinel values (like -1) or nullable pointers with an explicit, type-safe maybe-value.',
    'advanced',
    2,
    2680,
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
  ('cpp.utilities.file_io.lesson', 'cpp.utilities.file_io', true),
  ('cpp.utilities.file_io.mc_exists', 'cpp.utilities.file_io', true),
  ('cpp.utilities.chrono.lesson', 'cpp.utilities.chrono', true),
  ('cpp.utilities.chrono.mc_clock', 'cpp.utilities.chrono', true),
  ('cpp.utilities.random.lesson', 'cpp.utilities.random', true),
  ('cpp.utilities.random.mc_bias', 'cpp.utilities.random', true),
  ('cpp.utilities.variant.lesson', 'cpp.utilities.variant', true),
  ('cpp.utilities.variant.mc_optional', 'cpp.utilities.variant', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.utilities.file_io.mc_exists.a', 'cpp.utilities.file_io.mc_exists', 'std::filesystem::exists(path)', true, 10),
  ('cpp.utilities.file_io.mc_exists.b', 'cpp.utilities.file_io.mc_exists', 'std::cout << path', false, 20),
  ('cpp.utilities.file_io.mc_exists.c', 'cpp.utilities.file_io.mc_exists', 'std::string::find on the path text', false, 30),
  ('cpp.utilities.file_io.mc_exists.d', 'cpp.utilities.file_io.mc_exists', 'std::sort on the directory', false, 40),
  ('cpp.utilities.chrono.mc_clock.a', 'cpp.utilities.chrono.mc_clock', 'std::chrono::steady_clock', true, 10),
  ('cpp.utilities.chrono.mc_clock.b', 'cpp.utilities.chrono.mc_clock', 'std::chrono::system_clock', false, 20),
  ('cpp.utilities.chrono.mc_clock.c', 'cpp.utilities.chrono.mc_clock', 'The wall clock on the screen', false, 30),
  ('cpp.utilities.chrono.mc_clock.d', 'cpp.utilities.chrono.mc_clock', 'std::time(nullptr)', false, 40),
  ('cpp.utilities.random.mc_bias.a', 'cpp.utilities.random.mc_bias', 'A random engine with std::uniform_int_distribution(1, 6)', true, 10),
  ('cpp.utilities.random.mc_bias.b', 'cpp.utilities.random.mc_bias', 'rand() % 6 + 1', false, 20),
  ('cpp.utilities.random.mc_bias.c', 'cpp.utilities.random.mc_bias', 'Taking the system time modulo 6', false, 30),
  ('cpp.utilities.random.mc_bias.d', 'cpp.utilities.random.mc_bias', 'Hashing a counter modulo 6', false, 40),
  ('cpp.utilities.variant.mc_optional.a', 'cpp.utilities.variant.mc_optional', 'An int that may or may not be present, without a magic sentinel value', true, 10),
  ('cpp.utilities.variant.mc_optional.b', 'cpp.utilities.variant.mc_optional', 'A list of many ints', false, 20),
  ('cpp.utilities.variant.mc_optional.c', 'cpp.utilities.variant.mc_optional', 'An int shared safely between threads', false, 30),
  ('cpp.utilities.variant.mc_optional.d', 'cpp.utilities.variant.mc_optional', 'An int guaranteed to be prime', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
