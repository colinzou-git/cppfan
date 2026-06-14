-- Roadmap #79 / #120 (strings, second slice): learning items for the Z-function,
-- palindromic substrings (expand around center), and parsing edge cases.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.strings.z_function.lesson',
    'lesson',
    'Z-function',
    'The Z-function of a string s gives, for each index i, z[i] = the length of the longest substring starting at i that is also a prefix of s. By definition z[0] is usually left as 0 (or the whole length). For s = "aabxaab" the Z-array is [0, 1, 0, 0, 3, 1, 0]: at index 4 the substring "aab" matches the prefix "aab", so z[4] = 3. It is computed in O(n) by maintaining the rightmost [l, r] segment that matches a prefix (the "Z-box") and reusing earlier values inside it instead of recomparing. The Z-function solves pattern matching cleanly: to find pattern p in text t, build the string p + separator + t (the separator is a character in neither), compute its Z-array, and any position where z equals |p| marks a full occurrence of p. It is an O(n+m) alternative to KMP — often easier to reason about because z[i] has a direct meaning (prefix match length) rather than the failure-link indirection of the prefix function. It also powers tasks like counting distinct substrings and finding string periods.',
    'z[i] = length of the longest substring starting at i that matches a prefix of s, computed in O(n) via the rightmost Z-box. For matching, run the Z-function on p + sep + t and look for z == |p|. An O(n+m) alternative to KMP with a more direct meaning.',
    'advanced',
    6,
    4170,
    true
  ),
  (
    'dsa.strings.z_function.mc_meaning',
    'multiple_choice',
    'What a Z-value means',
    'In the Z-function of a string s, what does z[i] represent?',
    'z[i] is the length of the longest substring starting at position i that is also a prefix of s. Scanning for z[i] == |pattern| in pattern+separator+text finds all matches.',
    'advanced',
    2,
    4180,
    true
  ),
  (
    'dsa.strings.palindrome_substrings.lesson',
    'lesson',
    'Palindromic substrings',
    'To find palindromic substrings, the expand-around-center technique is the simplest strong method. Every palindrome has a center, and there are 2n-1 possible centers in a string of length n: n single characters (for odd-length palindromes) and n-1 gaps between adjacent characters (for even-length palindromes). For each center, expand outward while the two mirrored characters match; the widest successful expansion is the longest palindrome centered there. Doing this for every center finds the longest palindromic substring and counts all palindromic substrings in O(n^2) time and O(1) extra space — efficient enough for most inputs and easy to get right. A dynamic-programming table dp[i][j] = "is s[i..j] a palindrome" also runs in O(n^2) but uses O(n^2) space, so prefer center expansion unless you need the table for another sub-result. For the rare case that demands linear time, Manacher''s algorithm computes all palindromic radii in O(n), but it is intricate and worth reaching for only when O(n^2) is genuinely too slow.',
    'Expand-around-center checks all 2n-1 centers (odd + even), expanding while mirrored chars match: O(n^2) time, O(1) space, finds longest/counts all palindromic substrings. DP is also O(n^2) but O(n^2) space; Manacher is O(n) but intricate (enrichment).',
    'advanced',
    6,
    4190,
    true
  ),
  (
    'dsa.strings.palindrome_substrings.mc_centers',
    'multiple_choice',
    'Why 2n-1 centers',
    'When finding palindromic substrings by expanding around centers, why are there 2n-1 centers to check in a string of length n?',
    'Odd-length palindromes are centered on one of the n characters; even-length palindromes are centered on one of the n-1 gaps between adjacent characters. Together that is 2n-1 centers.',
    'advanced',
    2,
    4200,
    true
  ),
  (
    'dsa.strings.parsing_edge_cases.lesson',
    'lesson',
    'Parsing edge cases',
    'Real-world delimited input breaks naive splitters. The classic bug is using formatted extraction (`>>`) to read fields: it skips all whitespace and silently merges or drops empty fields, so a CSV line like `a,,c` loses the empty middle field. Use `std::getline(stream, field, '','')` instead — it preserves empty fields, including a trailing empty field after a final delimiter (`a,b,` yields three fields, the last empty). Watch for line endings: a file written on Windows uses CRLF, so reading lines with `getline` on `\n` leaves a trailing carriage return `\r` on each field; strip it before comparing or converting. Leading/trailing spaces around a field (`a, b , c`) are usually unwanted — trim them explicitly, since `getline` keeps them. Other traps: a delimiter inside a quoted field (true CSV needs a real parser, not a split), and a final line with no trailing newline. The rule: decide deliberately whether empty fields are significant, normalize line endings and whitespace, and never assume `>>` gives you the field structure you expect.',
    'Use getline(.., delim) not >> so empty fields (a,,c) and trailing empties (a,b,) survive. Strip CR from CRLF files, trim stray whitespace, and remember quoted delimiters need a real CSV parser. Decide explicitly whether empty fields matter.',
    'intermediate',
    5,
    4210,
    true
  ),
  (
    'dsa.strings.parsing_edge_cases.mc_empty',
    'multiple_choice',
    'Preserving empty fields',
    'You must parse the CSV line `a,,c` and keep the empty middle field. Which approach reliably preserves it?',
    'std::getline(stream, field, '','') returns each field between commas, including the empty one, so a,,c yields three fields. Reading with >> skips whitespace and merges fields, losing the empty entry.',
    'intermediate',
    2,
    4220,
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
  ('dsa.strings.z_function.lesson', 'dsa.strings.z_function', true),
  ('dsa.strings.z_function.mc_meaning', 'dsa.strings.z_function', true),
  ('dsa.strings.palindrome_substrings.lesson', 'dsa.strings.palindrome_substrings', true),
  ('dsa.strings.palindrome_substrings.mc_centers', 'dsa.strings.palindrome_substrings', true),
  ('dsa.strings.parsing_edge_cases.lesson', 'dsa.strings.parsing_edge_cases', true),
  ('dsa.strings.parsing_edge_cases.mc_empty', 'dsa.strings.parsing_edge_cases', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.strings.z_function.mc_meaning.a', 'dsa.strings.z_function.mc_meaning', 'The length of the longest substring starting at i that is also a prefix of s', true, 10),
  ('dsa.strings.z_function.mc_meaning.b', 'dsa.strings.z_function.mc_meaning', 'The length of the longest proper suffix of s[0..i] that is also a prefix', false, 20),
  ('dsa.strings.z_function.mc_meaning.c', 'dsa.strings.z_function.mc_meaning', 'The number of times s[i] occurs in s', false, 30),
  ('dsa.strings.z_function.mc_meaning.d', 'dsa.strings.z_function.mc_meaning', 'The index of the next occurrence of s[i]', false, 40),
  ('dsa.strings.palindrome_substrings.mc_centers.a', 'dsa.strings.palindrome_substrings.mc_centers', 'n single-character centers (odd) plus n-1 between-character centers (even)', true, 10),
  ('dsa.strings.palindrome_substrings.mc_centers.b', 'dsa.strings.palindrome_substrings.mc_centers', 'Each character can pair with every other character', false, 20),
  ('dsa.strings.palindrome_substrings.mc_centers.c', 'dsa.strings.palindrome_substrings.mc_centers', 'There are 2n prefixes and suffixes to compare', false, 30),
  ('dsa.strings.palindrome_substrings.mc_centers.d', 'dsa.strings.palindrome_substrings.mc_centers', 'Each substring has two distinct centers', false, 40),
  ('dsa.strings.parsing_edge_cases.mc_empty.a', 'dsa.strings.parsing_edge_cases.mc_empty', 'std::getline(stream, field, '','') for each field', true, 10),
  ('dsa.strings.parsing_edge_cases.mc_empty.b', 'dsa.strings.parsing_edge_cases.mc_empty', 'Reading fields with stream >> field', false, 20),
  ('dsa.strings.parsing_edge_cases.mc_empty.c', 'dsa.strings.parsing_edge_cases.mc_empty', 'Skipping any field that comes back empty', false, 30),
  ('dsa.strings.parsing_edge_cases.mc_empty.d', 'dsa.strings.parsing_edge_cases.mc_empty', 'Splitting only on whitespace', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
