-- Roadmap #79 / #120 (strings, fundamentals slice): learning items for character
-- traversal and frequency counting, substring vs subsequence, and character
-- classes / case handling.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.strings.char_frequency.lesson',
    'lesson',
    'Character traversal and frequency counting',
    'Many string problems reduce to counting characters. Traverse the string once with a loop (a range-based `for (char c : s)` or an index loop) and increment a counter per character — an O(n) pass. The counter can be a fixed-size array when the alphabet is small and known: for lowercase English letters use `int count[26]` indexed by `c - ''a''`; for arbitrary bytes use `int count[256]` indexed by `static_cast<unsigned char>(c)`. A fixed array is the fastest option and uses constant space. When the alphabet is large, sparse, or Unicode, use a hash map such as `std::unordered_map<char, int>` so you only store characters that actually appear. Frequency tables power anagram checks (two strings are anagrams exactly when their counts match), first-unique-character, most-frequent-character, and counting-sort over characters. Build the table in one pass, then answer queries from it instead of re-scanning the string.',
    'Count characters in one O(n) pass. Use a fixed array (count[26] indexed by c - ''a'', or count[256] by unsigned char) for a small known alphabet — constant space and fastest; use a hash map for large/sparse/Unicode alphabets. Frequency tables drive anagram, first-unique, and most-frequent queries.',
    'beginner',
    5,
    4530,
    true
  ),
  (
    'dsa.strings.char_frequency.mc_structure',
    'multiple_choice',
    'Counting lowercase letters',
    'You need to count occurrences of each lowercase English letter in a string as fast as possible. Which data structure is the most appropriate?',
    'A fixed int[26] indexed by c - ''a'' gives O(1) updates in constant space — the alphabet is small and known. A hash map works but adds overhead; sorting is O(n log n) and unnecessary; a set only tracks presence, not counts.',
    'beginner',
    2,
    4540,
    true
  ),
  (
    'dsa.strings.substring_subsequence.lesson',
    'lesson',
    'Substring vs subsequence',
    'A substring is a contiguous block of a string: choose a start and end index and take everything between them, so the characters stay adjacent and in order. A subsequence keeps the original left-to-right order but may skip characters, so its elements need not be adjacent. Every substring is a subsequence, but not the reverse. For "abcde": "bcd" is a substring (and a subsequence); "ace" is a subsequence but not a substring, because its characters are not contiguous; "cab" is neither, because it reorders characters. Counting differs sharply: a string of length n has n(n+1)/2 non-empty substrings (choose start <= end), but 2^n - 1 non-empty subsequences (each character is in or out). This is why substring problems (longest palindromic substring, substring search) are usually polynomial, while subsequence problems (longest common subsequence, longest increasing subsequence) often need dynamic programming over an exponential space of candidates. When you read a problem, first decide which one it means — the word choice changes the algorithm.',
    'Substring = contiguous slice; subsequence = order-preserving but possibly gapped. Every substring is a subsequence, not the reverse. In abcde, ace is a subsequence but not a substring. Counts: n(n+1)/2 substrings vs 2^n - 1 subsequences — which is why subsequence problems usually need DP.',
    'beginner',
    5,
    4550,
    true
  ),
  (
    'dsa.strings.substring_subsequence.mc_identify',
    'multiple_choice',
    'Spot the subsequence',
    'For the string "abcde", which of these is a subsequence but NOT a substring?',
    'ace keeps the original order (a, then c, then e) but skips b and d, so it is a subsequence; its characters are not contiguous in abcde, so it is not a substring. bcd is a contiguous substring; cab and edcba reorder characters, so they are neither.',
    'beginner',
    2,
    4560,
    true
  ),
  (
    'dsa.strings.case_handling.lesson',
    'lesson',
    'Character classes and case handling',
    'C++ classifies and converts characters with the <cctype> functions: `isalpha`, `isdigit`, `isalnum`, `isspace`, `ispunct`, plus `tolower` and `toupper`. There is a notorious trap: these functions take an `int` whose value must be representable as an `unsigned char` or equal EOF. If you pass a plain `char` that is negative (common for bytes >= 128 where `char` is signed), the behavior is undefined. Always cast first: `std::tolower(static_cast<unsigned char>(c))`. For case-insensitive comparison, fold both sides to the same case (lower or upper) before comparing, character by character or on transformed copies. These functions are locale-dependent and operate on single bytes, so they do not correctly handle multibyte/Unicode text — for that you need a Unicode library. For plain ASCII letters, digits, and case folding, <cctype> with the unsigned-char cast is the correct, portable tool.',
    '<cctype> gives isalpha/isdigit/isspace/tolower/toupper, but they are undefined behavior on a negative char — always pass static_cast<unsigned char>(c). Fold both sides to one case for case-insensitive compares. They are single-byte and locale-dependent, so they do not handle Unicode.',
    'beginner',
    5,
    4570,
    true
  ),
  (
    'dsa.strings.case_handling.mc_tolower',
    'multiple_choice',
    'Calling tolower safely',
    'Why can `std::tolower(c)` be undefined behavior when `c` is a plain `char`, and how do you call it safely?',
    'tolower takes an int that must be representable as unsigned char (or EOF). A signed char holding a byte >= 128 is negative, so passing it directly is undefined behavior. Cast first: std::tolower(static_cast<unsigned char>(c)).',
    'beginner',
    2,
    4580,
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
  ('dsa.strings.char_frequency.lesson', 'dsa.strings.char_frequency', true),
  ('dsa.strings.char_frequency.mc_structure', 'dsa.strings.char_frequency', true),
  ('dsa.strings.substring_subsequence.lesson', 'dsa.strings.substring_subsequence', true),
  ('dsa.strings.substring_subsequence.mc_identify', 'dsa.strings.substring_subsequence', true),
  ('dsa.strings.case_handling.lesson', 'dsa.strings.case_handling', true),
  ('dsa.strings.case_handling.mc_tolower', 'dsa.strings.case_handling', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.strings.char_frequency.mc_structure.a', 'dsa.strings.char_frequency.mc_structure', 'A fixed array int[26] indexed by c - ''a''', true, 10),
  ('dsa.strings.char_frequency.mc_structure.b', 'dsa.strings.char_frequency.mc_structure', 'A std::map<char, int> that grows as letters appear', false, 20),
  ('dsa.strings.char_frequency.mc_structure.c', 'dsa.strings.char_frequency.mc_structure', 'Sort the string, then count runs of equal characters', false, 30),
  ('dsa.strings.char_frequency.mc_structure.d', 'dsa.strings.char_frequency.mc_structure', 'A std::set<char> of the letters seen', false, 40),
  ('dsa.strings.substring_subsequence.mc_identify.a', 'dsa.strings.substring_subsequence.mc_identify', 'ace', true, 10),
  ('dsa.strings.substring_subsequence.mc_identify.b', 'dsa.strings.substring_subsequence.mc_identify', 'bcd', false, 20),
  ('dsa.strings.substring_subsequence.mc_identify.c', 'dsa.strings.substring_subsequence.mc_identify', 'cab', false, 30),
  ('dsa.strings.substring_subsequence.mc_identify.d', 'dsa.strings.substring_subsequence.mc_identify', 'edcba', false, 40),
  ('dsa.strings.case_handling.mc_tolower.a', 'dsa.strings.case_handling.mc_tolower', 'char may be signed, so cast: std::tolower(static_cast<unsigned char>(c))', true, 10),
  ('dsa.strings.case_handling.mc_tolower.b', 'dsa.strings.case_handling.mc_tolower', 'It is always safe; std::tolower accepts any char directly', false, 20),
  ('dsa.strings.case_handling.mc_tolower.c', 'dsa.strings.case_handling.mc_tolower', 'Cast the result to char; the argument never matters', false, 30),
  ('dsa.strings.case_handling.mc_tolower.d', 'dsa.strings.case_handling.mc_tolower', 'Pass the char as a std::string of length one instead', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
