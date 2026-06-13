-- Roadmap #65 / #79 (stage 10): learning items for string manipulation, searching, palindromes, parsing.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.strings.manipulation.lesson',
    'lesson',
    'String manipulation',
    'A C++ std::string is a growable array of characters with size, operator[], substr, append, and +=. The key performance trap is building a long string with repeated result = result + piece inside a loop: each + may allocate and copy the whole accumulated string, giving O(n^2) total work. Prefer += (append in place) or reserve capacity up front. Use substr(pos, len) to slice and remember it returns a new string (a copy). For read-only views that avoid copies, std::string_view refers to existing characters without owning them.',
    'Repeated s = s + piece is O(n^2) because each concatenation copies the whole string; append in place with += (or reserve) for linear cost.',
    'intermediate',
    5,
    2310,
    true
  ),
  (
    'dsa.strings.manipulation.mc_concat',
    'multiple_choice',
    'Concatenation cost',
    'Why can building a long string with result = result + piece inside a loop be O(n^2)?',
    'Each result + piece builds a brand-new string by copying all characters accumulated so far, so over n iterations the copying work grows quadratically. Appending in place with += avoids the repeated full copies.',
    'intermediate',
    2,
    2320,
    true
  ),
  (
    'dsa.strings.searching.lesson',
    'lesson',
    'Substring search',
    'Finding a pattern of length m inside text of length n can be done naively by trying every start position and comparing characters, which is O(n*m) in the worst case (think "aaaa...a" searched for "aaab"). The Knuth-Morris-Pratt (KMP) algorithm precomputes a failure table from the pattern so that after a mismatch it never re-examines already-matched text characters, giving O(n + m) time. For most everyday cases std::string::find is fine; KMP matters when the text is huge or worst-case inputs are adversarial.',
    'Naive substring search is O(n*m) worst case; KMP uses a precomputed failure table to avoid re-scanning matched characters and runs in O(n + m).',
    'advanced',
    6,
    2330,
    true
  ),
  (
    'dsa.strings.searching.mc_kmp',
    'multiple_choice',
    'KMP complexity',
    'What is the time complexity of KMP substring search on text length n and pattern length m?',
    'KMP precomputes a failure table in O(m) and scans the text once without backtracking, so the total is O(n + m) — better than naive O(n*m) on adversarial inputs.',
    'advanced',
    2,
    2340,
    true
  ),
  (
    'dsa.strings.palindrome.lesson',
    'lesson',
    'Palindromes and anagrams',
    'To check whether a string is a palindrome, put one pointer at the start and one at the end, compare the characters, and step both inward until they meet — O(n) time and O(1) extra space. To check whether two strings are anagrams (same letters, any order), count the frequency of each character in both and compare the counts (an array of 26 for lowercase letters, or a hash map for arbitrary characters), also O(n). Both problems are about structure of characters rather than order of comparison, so counting and two pointers beat sorting.',
    'Palindrome checks use two pointers moving inward (O(n), O(1) space); anagram checks compare per-character frequency counts (O(n)).',
    'intermediate',
    5,
    2350,
    true
  ),
  (
    'dsa.strings.palindrome.mc_anagram',
    'multiple_choice',
    'Detecting an anagram',
    'What is an O(n) way to decide whether two strings are anagrams of each other?',
    'Count how many times each character appears in each string and compare the counts. If every character count matches, the strings are anagrams — this is O(n), faster than sorting both strings.',
    'intermediate',
    2,
    2360,
    true
  ),
  (
    'dsa.strings.parsing.lesson',
    'lesson',
    'Tokenizing and parsing',
    'Parsing turns raw text into meaningful pieces. The simplest step is tokenizing: splitting a line into tokens on a delimiter. In C++ you can feed a line into a std::istringstream and read tokens with >> (whitespace-separated) or use std::getline(stream, token, '','') to split on a custom delimiter such as a comma. Reading numbers with >> into an int or double does the conversion for you. Watch the edge cases: empty fields, trailing delimiters, and leading/trailing whitespace all change how many tokens you get.',
    'Tokenize by streaming a line through istringstream and extracting with >> or getline(.., delim); mind empty fields and trailing delimiters.',
    'intermediate',
    5,
    2370,
    true
  ),
  (
    'dsa.strings.parsing.mc_delim',
    'multiple_choice',
    'Splitting on a delimiter',
    'Which standard tool splits a string into fields on a custom delimiter such as a comma?',
    'std::getline(stream, token, '','') reads up to each comma, making it the idiomatic way to split a line into comma-separated fields. Plain >> only splits on whitespace.',
    'intermediate',
    2,
    2380,
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
  ('dsa.strings.manipulation.lesson', 'dsa.strings.manipulation', true),
  ('dsa.strings.manipulation.mc_concat', 'dsa.strings.manipulation', true),
  ('dsa.strings.searching.lesson', 'dsa.strings.searching', true),
  ('dsa.strings.searching.mc_kmp', 'dsa.strings.searching', true),
  ('dsa.strings.palindrome.lesson', 'dsa.strings.palindrome', true),
  ('dsa.strings.palindrome.mc_anagram', 'dsa.strings.palindrome', true),
  ('dsa.strings.parsing.lesson', 'dsa.strings.parsing', true),
  ('dsa.strings.parsing.mc_delim', 'dsa.strings.parsing', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.strings.manipulation.mc_concat.a', 'dsa.strings.manipulation.mc_concat', 'Each concatenation copies all characters accumulated so far', true, 10),
  ('dsa.strings.manipulation.mc_concat.b', 'dsa.strings.manipulation.mc_concat', 'Strings are immutable, so it cannot be done at all', false, 20),
  ('dsa.strings.manipulation.mc_concat.c', 'dsa.strings.manipulation.mc_concat', 'The compiler inserts a sort on every step', false, 30),
  ('dsa.strings.manipulation.mc_concat.d', 'dsa.strings.manipulation.mc_concat', 'It allocates exactly one byte per iteration', false, 40),
  ('dsa.strings.searching.mc_kmp.a', 'dsa.strings.searching.mc_kmp', 'O(n + m)', true, 10),
  ('dsa.strings.searching.mc_kmp.b', 'dsa.strings.searching.mc_kmp', 'O(n * m)', false, 20),
  ('dsa.strings.searching.mc_kmp.c', 'dsa.strings.searching.mc_kmp', 'O(n^2)', false, 30),
  ('dsa.strings.searching.mc_kmp.d', 'dsa.strings.searching.mc_kmp', 'O(m log n)', false, 40),
  ('dsa.strings.palindrome.mc_anagram.a', 'dsa.strings.palindrome.mc_anagram', 'Count each character frequency in both strings and compare the counts', true, 10),
  ('dsa.strings.palindrome.mc_anagram.b', 'dsa.strings.palindrome.mc_anagram', 'Compare the strings with two pointers from both ends', false, 20),
  ('dsa.strings.palindrome.mc_anagram.c', 'dsa.strings.palindrome.mc_anagram', 'Reverse one string and check equality', false, 30),
  ('dsa.strings.palindrome.mc_anagram.d', 'dsa.strings.palindrome.mc_anagram', 'Hash the whole string and compare hashes', false, 40),
  ('dsa.strings.parsing.mc_delim.a', 'dsa.strings.parsing.mc_delim', 'std::getline(stream, token, '','')', true, 10),
  ('dsa.strings.parsing.mc_delim.b', 'dsa.strings.parsing.mc_delim', 'stream >> token', false, 20),
  ('dsa.strings.parsing.mc_delim.c', 'dsa.strings.parsing.mc_delim', 'std::sort(token.begin(), token.end())', false, 30),
  ('dsa.strings.parsing.mc_delim.d', 'dsa.strings.parsing.mc_delim', 'token.push_back('','')', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
