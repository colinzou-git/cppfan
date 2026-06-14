-- Roadmap #80 / #121 (utilities, second slice): learning items for filesystem
-- paths/directories, text vs binary I/O, and visiting a variant.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.utilities.filesystem.lesson',
    'lesson',
    'Filesystem paths and directories',
    'std::filesystem (C++17, namespace alias `namespace fs = std::filesystem;`) gives portable file and path handling so you never hand-build path strings. Compose paths with `operator/`: `fs::path p = dir / "data" / "log.txt";` inserts the correct separator on every OS. Query the filesystem with `fs::exists(p)`, `fs::is_directory(p)`, `fs::is_regular_file(p)`, and `fs::file_size(p)`; build structure with `fs::create_directories(p)`. Walk a folder with `for (const auto& entry : fs::directory_iterator(dir))` (one level) or `fs::recursive_directory_iterator` (the whole tree), reading `entry.path()`. Decompose a path with `.filename()`, `.stem()`, `.extension()`, and `.parent_path()`. Error handling comes in two flavors: the throwing form (`fs::create_directory(p)` raises `fs::filesystem_error` on failure) and the non-throwing form that takes a `std::error_code&` out-parameter (`fs::create_directory(p, ec)`), which sets `ec` instead of throwing — use the error_code overload when a failure is expected and recoverable, and let exceptions propagate truly unexpected errors.',
    'std::filesystem builds portable paths with operator/ and offers exists/is_directory/file_size, create_directories, and directory_iterator/recursive_directory_iterator. Each operation has a throwing form and a non-throwing std::error_code overload — use error_code for expected failures.',
    'intermediate',
    6,
    4230,
    true
  ),
  (
    'cpp.utilities.filesystem.mc_join',
    'multiple_choice',
    'Composing a portable path',
    'What is the portable way to join a directory path and a filename with std::filesystem?',
    'fs::path supports operator/, e.g. dir / "log.txt", which inserts the correct platform separator. Manually concatenating with "/" or "\\" is not portable.',
    'intermediate',
    2,
    4240,
    true
  ),
  (
    'cpp.utilities.binary_io.lesson',
    'lesson',
    'Text vs binary I/O',
    'Streams default to *text* mode, which is convenient for human-readable data but transforms bytes: formatted `<<`/`>>` parse and stringify values, and on Windows a `\n` written in text mode becomes the two bytes `\r\n` on disk (and is translated back on read). For data that must round-trip exactly — images, serialized structs, compressed blobs — open the stream with `std::ios::binary` (`std::ofstream out(path, std::ios::binary);`) and move raw bytes with the unformatted `out.write(reinterpret_cast<const char*>(&value), sizeof value);` and `in.read(...)`, which copy `sizeof` bytes verbatim with no newline translation or parsing. Binary I/O is exact and compact but not portable across machines with different endianness, struct padding, or type sizes, so define an explicit on-disk format (fixed-width integers, documented byte order) when files cross systems. Rule of thumb: text mode and `<<`/`>>` for logs, config, and CSV; binary mode and read/write for exact byte-level serialization where size and fidelity matter.',
    'Text mode parses values and (on Windows) translates \n to \r\n; binary mode (std::ios::binary) with read/write copies exact bytes, no translation. Use text for human-readable data, binary for exact serialization — but binary is not portable across endianness/padding.',
    'intermediate',
    6,
    4250,
    true
  ),
  (
    'cpp.utilities.binary_io.mc_mode',
    'multiple_choice',
    'When to use binary mode',
    'Why open a file with std::ios::binary and use read/write instead of << / >> for serialized data?',
    'Binary mode copies bytes verbatim with no formatting or newline translation (e.g. no \n to \r\n on Windows), so the data round-trips exactly. Formatted << / >> would reinterpret and alter the bytes.',
    'intermediate',
    2,
    4260,
    true
  ),
  (
    'cpp.utilities.variant_visit.lesson',
    'lesson',
    'Visiting a variant',
    'Once a value is a `std::variant<A, B, C>`, you need to act on whichever alternative it currently holds. `std::get_if` works for a single check, but `std::visit` is the idiomatic way to handle *every* alternative: `std::visit(visitor, v)` calls `visitor` with the active value, and the compiler requires the visitor to handle all alternatives — so adding a new type to the variant turns an unhandled case into a compile error rather than a runtime surprise. The common visitor is an overload set built from lambdas, often with the "overloaded" helper: `std::visit(overloaded{ [](A a){...}, [](B b){...}, [](C c){...} }, v);`. A single generic lambda `[](auto&& x){...}` can handle all alternatives uniformly when the same code works for each. visit can also return a value (all branches must share a common return type) and can visit multiple variants at once. Reach for std::visit whenever you would otherwise write a chain of `get_if`/`holds_alternative` checks — it is exhaustive, extensible, and avoids forgotten cases.',
    'std::visit applies a visitor to the active alternative of a variant and forces every alternative to be handled (a new type becomes a compile error). Build the visitor from an overload set of lambdas (the overloaded helper) or a generic lambda; it can return a value and visit multiple variants.',
    'advanced',
    6,
    4270,
    true
  ),
  (
    'cpp.utilities.variant_visit.mc_exhaustive',
    'multiple_choice',
    'Why visit over get_if chains',
    'What advantage does std::visit give over a chain of std::get_if / holds_alternative checks on a variant?',
    'std::visit requires the visitor to handle every alternative, so adding a new type to the variant becomes a compile error instead of a silently missed case. Manual get_if chains can forget a case and fail at runtime.',
    'advanced',
    2,
    4280,
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
  ('cpp.utilities.filesystem.lesson', 'cpp.utilities.filesystem', true),
  ('cpp.utilities.filesystem.mc_join', 'cpp.utilities.filesystem', true),
  ('cpp.utilities.binary_io.lesson', 'cpp.utilities.binary_io', true),
  ('cpp.utilities.binary_io.mc_mode', 'cpp.utilities.binary_io', true),
  ('cpp.utilities.variant_visit.lesson', 'cpp.utilities.variant_visit', true),
  ('cpp.utilities.variant_visit.mc_exhaustive', 'cpp.utilities.variant_visit', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.utilities.filesystem.mc_join.a', 'cpp.utilities.filesystem.mc_join', 'dir / "log.txt" using fs::path operator/', true, 10),
  ('cpp.utilities.filesystem.mc_join.b', 'cpp.utilities.filesystem.mc_join', 'dir + "/" + "log.txt" as std::string', false, 20),
  ('cpp.utilities.filesystem.mc_join.c', 'cpp.utilities.filesystem.mc_join', 'dir + "\\log.txt" with a backslash', false, 30),
  ('cpp.utilities.filesystem.mc_join.d', 'cpp.utilities.filesystem.mc_join', 'std::strcat(dir, "log.txt")', false, 40),
  ('cpp.utilities.binary_io.mc_mode.a', 'cpp.utilities.binary_io.mc_mode', 'It copies bytes verbatim with no formatting or newline translation, so data round-trips exactly', true, 10),
  ('cpp.utilities.binary_io.mc_mode.b', 'cpp.utilities.binary_io.mc_mode', 'Binary mode is always faster for every kind of file', false, 20),
  ('cpp.utilities.binary_io.mc_mode.c', 'cpp.utilities.binary_io.mc_mode', 'It makes the file portable across all machines automatically', false, 30),
  ('cpp.utilities.binary_io.mc_mode.d', 'cpp.utilities.binary_io.mc_mode', 'It compresses the data as it writes', false, 40),
  ('cpp.utilities.variant_visit.mc_exhaustive.a', 'cpp.utilities.variant_visit.mc_exhaustive', 'It forces every alternative to be handled, so a new variant type becomes a compile error', true, 10),
  ('cpp.utilities.variant_visit.mc_exhaustive.b', 'cpp.utilities.variant_visit.mc_exhaustive', 'It runs the variant''s branches in parallel', false, 20),
  ('cpp.utilities.variant_visit.mc_exhaustive.c', 'cpp.utilities.variant_visit.mc_exhaustive', 'It lets the variant hold more than one type at once', false, 30),
  ('cpp.utilities.variant_visit.mc_exhaustive.d', 'cpp.utilities.variant_visit.mc_exhaustive', 'It removes the need to declare the variant''s types', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
