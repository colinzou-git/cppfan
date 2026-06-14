-- Roadmap #80 / #121 (utilities, third slice): learning items for chrono
-- clocks/durations, quality random numbers, and whole-line getline input.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.utilities.chrono_depth.lesson',
    'lesson',
    'Clocks, durations, and time points',
    'std::chrono separates three ideas. A duration is a span of time with a unit, written as types like `std::chrono::milliseconds` or `std::chrono::duration<double>`; a time_point is a moment, returned by a clock''s `now()`; and subtracting two time_points yields a duration. Pick the right clock: `std::chrono::steady_clock` never jumps backward and is the only correct choice for measuring elapsed time (a benchmark or timeout), while `system_clock` tracks wall-clock calendar time but can be adjusted by NTP or the user — never time intervals with it. The pattern is `auto t0 = steady_clock::now(); /* work */ auto t1 = steady_clock::now();` then convert the difference: `auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();`. Conversions to coarser units (e.g. nanoseconds to milliseconds) truncate, so they require an explicit `duration_cast`; conversions to finer or exact units are implicit. C++14 literals like `using namespace std::chrono_literals; auto d = 250ms;` make durations readable. Rule: steady_clock for elapsed time, system_clock for dates, and always state units via the duration type rather than passing bare integers.',
    'chrono separates duration (span+unit), time_point (a moment from clock::now()), and clocks. Use steady_clock for elapsed time (monotonic), system_clock for calendar time. Subtract time_points to get a duration; duration_cast for lossy/coarser conversions (it truncates).',
    'intermediate',
    6,
    4410,
    true
  ),
  (
    'cpp.utilities.chrono_depth.mc_clock',
    'multiple_choice',
    'Choosing a clock for elapsed time',
    'Which clock should you use to measure how long a section of code takes to run?',
    'std::chrono::steady_clock is monotonic — it never jumps backward — so it is the correct clock for measuring elapsed time. system_clock can be adjusted (NTP, manual changes) and may even go backward, corrupting interval measurements.',
    'intermediate',
    2,
    4420,
    true
  ),
  (
    'cpp.utilities.random_quality.lesson',
    'lesson',
    'Quality random numbers',
    'The `<random>` library separates two roles that the old `rand()` conflated: an *engine* produces raw random bits (e.g. `std::mt19937`, a fast Mersenne Twister, or `std::mt19937_64`), and a *distribution* maps those bits onto the shape you want (e.g. `std::uniform_int_distribution<int> dist(1, 6);` for a fair die, or `std::uniform_real_distribution<double>` for a range of reals). You seed the engine once — `std::mt19937 gen(std::random_device{}());` — and then call `dist(gen)` repeatedly; do not reseed per draw, and do not create a new engine inside a loop. The classic bug is `rand() % n`, which is biased: unless n divides RAND_MAX+1 evenly, the low remainders occur slightly more often (modulo bias), and `rand()`''s low bits are often poor quality besides. `uniform_int_distribution` handles the range correctly with no bias. For reproducible tests, seed with a fixed constant instead of random_device. Rule: one engine, seeded once; a distribution for the range; never rand()%n.',
    '<random> splits the engine (raw bits, e.g. mt19937) from the distribution (shape, e.g. uniform_int_distribution). Seed the engine once, then call dist(gen). Avoid rand()%n: it has modulo bias and poor low bits. Use a fixed seed for reproducible tests.',
    'intermediate',
    6,
    4430,
    true
  ),
  (
    'cpp.utilities.random_quality.mc_bias',
    'multiple_choice',
    'Why avoid rand() % n',
    'Why is `rand() % n` a poor way to get a uniform random integer in [0, n)?',
    'Unless n divides RAND_MAX+1 evenly, the modulo wraps unevenly so smaller remainders appear more often — modulo bias. std::uniform_int_distribution over a seeded engine produces an unbiased value in the range.',
    'intermediate',
    2,
    4440,
    true
  ),
  (
    'cpp.utilities.getline_input.lesson',
    'lesson',
    'Whole-line input with getline',
    '`std::getline(stream, line)` reads everything up to (and discarding) the next newline into `line`, so it is the way to read input that contains spaces — a full name, a sentence, or a whole line of a file. Loop with `while (std::getline(in, line)) { ... }` to process a file line by line; the loop ends cleanly at end-of-file. The classic pitfall is mixing `>>` with `getline`: formatted extraction like `std::cin >> n;` reads the number but leaves the trailing newline in the buffer, so the very next `std::getline` returns an empty string (it stops immediately at that leftover newline). The fix is to discard the rest of the line after the `>>`: `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), ''\n'');` before calling getline. `getline` also takes an optional delimiter (`std::getline(in, field, '','')`) to split on something other than newline. Rule: use getline for lines/spaces, `>>` for individual tokens, and clear the newline when you switch from `>>` to getline.',
    'std::getline reads a whole line (including spaces) up to the newline; loop while (getline(in, line)) to read a file line by line. After >> leaves a trailing newline, call cin.ignore(max, ''\n'') before getline or it reads an empty line. getline takes an optional delimiter.',
    'intermediate',
    5,
    4450,
    true
  ),
  (
    'cpp.utilities.getline_input.mc_mix',
    'multiple_choice',
    'Mixing >> and getline',
    'After `std::cin >> n;`, the next `std::getline(std::cin, line)` returns an empty string. Why, and how do you fix it?',
    'The >> left the trailing newline in the buffer, so getline stops immediately at it. Call std::cin.ignore(std::numeric_limits<std::streamsize>::max(), ''\n'') after the >> to discard the rest of the line before getline.',
    'intermediate',
    2,
    4460,
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
  ('cpp.utilities.chrono_depth.lesson', 'cpp.utilities.chrono_depth', true),
  ('cpp.utilities.chrono_depth.mc_clock', 'cpp.utilities.chrono_depth', true),
  ('cpp.utilities.random_quality.lesson', 'cpp.utilities.random_quality', true),
  ('cpp.utilities.random_quality.mc_bias', 'cpp.utilities.random_quality', true),
  ('cpp.utilities.getline_input.lesson', 'cpp.utilities.getline_input', true),
  ('cpp.utilities.getline_input.mc_mix', 'cpp.utilities.getline_input', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.utilities.chrono_depth.mc_clock.a', 'cpp.utilities.chrono_depth.mc_clock', 'std::chrono::steady_clock (monotonic, never goes backward)', true, 10),
  ('cpp.utilities.chrono_depth.mc_clock.b', 'cpp.utilities.chrono_depth.mc_clock', 'std::chrono::system_clock (wall-clock calendar time)', false, 20),
  ('cpp.utilities.chrono_depth.mc_clock.c', 'cpp.utilities.chrono_depth.mc_clock', 'Whichever clock has the smallest period', false, 30),
  ('cpp.utilities.chrono_depth.mc_clock.d', 'cpp.utilities.chrono_depth.mc_clock', 'std::time(nullptr) in seconds', false, 40),
  ('cpp.utilities.random_quality.mc_bias.a', 'cpp.utilities.random_quality.mc_bias', 'Unless n divides the range evenly, smaller remainders occur more often (modulo bias)', true, 10),
  ('cpp.utilities.random_quality.mc_bias.b', 'cpp.utilities.random_quality.mc_bias', 'rand() always returns even numbers', false, 20),
  ('cpp.utilities.random_quality.mc_bias.c', 'cpp.utilities.random_quality.mc_bias', 'The modulo operator is too slow', false, 30),
  ('cpp.utilities.random_quality.mc_bias.d', 'cpp.utilities.random_quality.mc_bias', 'rand() cannot return zero', false, 40),
  ('cpp.utilities.getline_input.mc_mix.a', 'cpp.utilities.getline_input.mc_mix', 'The >> left a trailing newline; call cin.ignore(max, ''\n'') before getline', true, 10),
  ('cpp.utilities.getline_input.mc_mix.b', 'cpp.utilities.getline_input.mc_mix', 'getline is broken after >>; never combine them', false, 20),
  ('cpp.utilities.getline_input.mc_mix.c', 'cpp.utilities.getline_input.mc_mix', 'You must call cin.clear() to reset an error state', false, 30),
  ('cpp.utilities.getline_input.mc_mix.d', 'cpp.utilities.getline_input.mc_mix', 'n was read incorrectly, so line is skipped', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
