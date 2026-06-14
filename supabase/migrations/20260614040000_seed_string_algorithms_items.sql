-- Roadmap #79 / #120 (string algorithms): learning items for prefix
-- function/KMP table, tries, and string hashing (rolling hash).
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.strings.prefix_function.lesson',
    'lesson',
    'Prefix function and the KMP table',
    'The prefix function of a string is the engine behind KMP. For each position i, pi[i] is the length of the longest proper prefix of the substring s[0..i] that is also a suffix of it — "proper" meaning it is not the whole substring. For the pattern "ABABC" the table is [0, 0, 1, 2, 0]: at "ABAB" the prefix "AB" reappears as the suffix, so pi = 2; the final C breaks the match, resetting to 0. You build it in O(m) by extending the previous longest match and, on a mismatch, falling back to pi[k-1] instead of starting over. KMP then scans the text once: when a character mismatches after matching k pattern characters, it jumps the pattern forward using pi[k-1] rather than rewinding the text pointer, giving O(n + m) total. The intuition to remember: the prefix function tells you how much of the pattern you have already effectively matched, so you never re-examine text you have already cleared.',
    'pi[i] = length of the longest proper prefix of s[0..i] that is also a suffix. KMP uses it to skip back to pi[k-1] on a mismatch instead of rescanning the text, giving O(n + m) search.',
    'advanced',
    6,
    3930,
    true
  ),
  (
    'dsa.strings.prefix_function.mc_value',
    'multiple_choice',
    'Reading a prefix-function value',
    'In the prefix function (KMP failure table), what does the value pi[i] represent for the substring s[0..i]?',
    'pi[i] is the length of the longest proper prefix of s[0..i] that is also a suffix of it. KMP uses this length to decide how far to shift the pattern after a mismatch.',
    'advanced',
    2,
    3940,
    true
  ),
  (
    'dsa.strings.trie.lesson',
    'lesson',
    'Tries (prefix trees)',
    'A trie stores a set of strings as a tree of characters: the root is empty, each edge is one character, and each path from the root spells a prefix shared by every word below it. A node flagged as end-of-word marks a complete string. Insert and lookup of a word of length L take O(L), independent of how many words the trie holds, and — unlike a hash set — a trie answers prefix questions directly: "how many words start with ''pre''?" or "give me all completions of this prefix" just walk to the prefix node and explore its subtree. That makes tries the natural structure for autocomplete, dictionary/spell-check, and longest-prefix routing. The tradeoff is memory: every node carries child pointers (up to the alphabet size), so for sparse or few keys a hash map is lighter; choose a trie when prefix queries or ordered traversal matter, a hash map when you only need exact-key membership.',
    'A trie stores strings by shared character prefixes; insert/lookup is O(L) and prefix/autocomplete queries are direct. It costs more memory than a hash map, so prefer it when prefix queries (not just exact membership) matter.',
    'advanced',
    6,
    3950,
    true
  ),
  (
    'dsa.strings.trie.mc_usecase',
    'multiple_choice',
    'When a trie beats a hash map',
    'For which task does a trie have a clear advantage over a hash set of the same strings?',
    'A trie answers prefix queries (autocomplete: all words starting with a given prefix) by walking to the prefix node and exploring its subtree. A hash set only supports exact-key membership, not prefix enumeration.',
    'advanced',
    2,
    3960,
    true
  ),
  (
    'dsa.strings.hashing.lesson',
    'lesson',
    'String hashing and rolling hash',
    'A polynomial string hash maps a string to a number: treat the characters as digits in base b and compute the value modulo a large prime m, e.g. hash = (s[0]*b^(k-1) + s[1]*b^(k-2) + ... + s[k-1]) mod m. The payoff is a rolling hash: once you have the hash of one window of length k, you get the next window in O(1) by removing the leading character''s contribution, multiplying by b, and adding the new trailing character. This powers Rabin-Karp substring search and lets you compare two substrings for equality in O(1) after O(n) preprocessing. The catch is collisions: two different strings can share a hash, so a hash match is only probable equality, not proof. Safeguards are essential — verify a candidate match character-by-character, or use double hashing (two independent moduli) to make a false positive astronomically unlikely. Treat single-hash equality as a fast filter, never as the final answer when correctness matters.',
    'A polynomial rolling hash compares substrings in O(1) after O(n) setup (Rabin-Karp). Hashes can collide, so a match is only probable equality — verify directly or use double hashing.',
    'advanced',
    6,
    3970,
    true
  ),
  (
    'dsa.strings.hashing.mc_collision',
    'multiple_choice',
    'Trusting a hash match',
    'Two substrings have the same rolling-hash value. What can you correctly conclude?',
    'Equal hashes mean the substrings are *probably* equal, not certainly — different strings can collide to the same hash. Confirm by comparing characters directly, or reduce the risk with double hashing.',
    'advanced',
    2,
    3980,
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
  ('dsa.strings.prefix_function.lesson', 'dsa.strings.prefix_function', true),
  ('dsa.strings.prefix_function.mc_value', 'dsa.strings.prefix_function', true),
  ('dsa.strings.trie.lesson', 'dsa.strings.trie', true),
  ('dsa.strings.trie.mc_usecase', 'dsa.strings.trie', true),
  ('dsa.strings.hashing.lesson', 'dsa.strings.hashing', true),
  ('dsa.strings.hashing.mc_collision', 'dsa.strings.hashing', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.strings.prefix_function.mc_value.a', 'dsa.strings.prefix_function.mc_value', 'The length of the longest proper prefix of s[0..i] that is also a suffix', true, 10),
  ('dsa.strings.prefix_function.mc_value.b', 'dsa.strings.prefix_function.mc_value', 'The index in the text where the pattern was found', false, 20),
  ('dsa.strings.prefix_function.mc_value.c', 'dsa.strings.prefix_function.mc_value', 'The number of times s[i] appears in the string', false, 30),
  ('dsa.strings.prefix_function.mc_value.d', 'dsa.strings.prefix_function.mc_value', 'The ASCII code of the character s[i]', false, 40),
  ('dsa.strings.trie.mc_usecase.a', 'dsa.strings.trie.mc_usecase', 'Autocomplete: listing all words that start with a given prefix', true, 10),
  ('dsa.strings.trie.mc_usecase.b', 'dsa.strings.trie.mc_usecase', 'Checking exact membership of a single key', false, 20),
  ('dsa.strings.trie.mc_usecase.c', 'dsa.strings.trie.mc_usecase', 'Using the least possible memory for a few keys', false, 30),
  ('dsa.strings.trie.mc_usecase.d', 'dsa.strings.trie.mc_usecase', 'Hashing a string to a single integer', false, 40),
  ('dsa.strings.hashing.mc_collision.a', 'dsa.strings.hashing.mc_collision', 'They are probably equal, but you must verify (collisions are possible)', true, 10),
  ('dsa.strings.hashing.mc_collision.b', 'dsa.strings.hashing.mc_collision', 'They are guaranteed to be identical', false, 20),
  ('dsa.strings.hashing.mc_collision.c', 'dsa.strings.hashing.mc_collision', 'They are guaranteed to be different', false, 30),
  ('dsa.strings.hashing.mc_collision.d', 'dsa.strings.hashing.mc_collision', 'Nothing, because hashes are random', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
