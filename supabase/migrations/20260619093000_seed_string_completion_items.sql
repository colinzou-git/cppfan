-- Roadmap #79 / #120 final string coverage: trace fixtures, method choice, and
-- double-hashing enrichment. Idempotent; mirrored in
-- src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.strings.searching.code_naive_trace',
    'code_reading',
    'Trace naive substring search',
    $prompt$Trace table:

```text
text:    a a a a b
pattern: a a a b
starts:  0 1
```

Text equivalent: Naive search tries each start. At start 0 it matches a, a, a, then mismatches pattern b against text a. It then shifts by one and repeats most comparisons at start 1.

Why does this input make naive substring search repeat work, and what is the worst-case time complexity for text length n and pattern length m?$prompt$,
    $explanation$The almost-matching prefix causes each start position to compare several characters before failing, then the next start repeats those comparisons. In the worst case, naive search tries O(n) starts and O(m) characters per start, for O(n*m) time.$explanation$,
    'advanced',
    3,
    2345,
    true
  ),
  (
    'dsa.strings.searching.mc_method_constraints',
    'multiple_choice',
    'Choose a string matching method',
    $prompt$You need guaranteed linear-time pattern matching on a very large adversarial text, and you only need exact matches for one pattern. Which method best fits?$prompt$,
    $explanation$KMP gives deterministic O(n + m) time for exact matching after building the prefix table. Z-function is also linear and valid, but the prefix table is the direct KMP fit here; rolling hash is probabilistic unless matches are verified, and a trie is for many keys/prefix queries.$explanation$,
    'advanced',
    2,
    2346,
    true
  ),
  (
    'dsa.strings.prefix_function.code_table_trace',
    'code_reading',
    'Read a KMP prefix table',
    $prompt$Trace table:

```text
i:      0 1 2 3 4
s[i]:   A B A B C
pi[i]:  0 0 1 2 0
```

Text equivalent: For ABABC, the prefix table is 0, 0, 1, 2, 0. At index 3, AB is both a proper prefix and suffix of ABAB; index 4 resets to 0 because C breaks that border.

Read the table: what does pi[3] = 2 mean, and why does pi[4] fall back to 0?$prompt$,
    $explanation$pi[3] = 2 means AB is both a proper prefix and suffix of ABAB. At index 4 the character C does not extend the current AB border, and the shorter fallback borders do not match either, so pi[4] becomes 0.$explanation$,
    'advanced',
    3,
    3945,
    true
  ),
  (
    'dsa.strings.hashing.mc_double_hash',
    'multiple_choice',
    'When double hashing helps',
    $prompt$A rolling-hash substring comparator uses two independent moduli instead of one. What guarantee does this give?$prompt$,
    $explanation$Double hashing makes accidental collisions dramatically less likely, but it is still a probabilistic filter. If the problem requires absolute correctness, verify candidate matches character-by-character.$explanation$,
    'advanced',
    2,
    3985,
    true
  ),
  (
    'dsa.strings.z_function.code_table_trace',
    'code_reading',
    'Read a Z-array trace',
    $prompt$Trace table:

```text
i:     0 1 2 3 4 5 6
s[i]:  a a b x a a b
z[i]:  0 1 0 0 3 1 0
```

Text equivalent: For aabxaab, z[4] is 3 because the substring starting at index 4 is aab, which matches the string prefix aab.

Read the table: why is z[4] = 3, and how would this style of value identify a pattern match in pattern+separator+text?$prompt$,
    $explanation$z[4] = 3 because the substring starting at index 4 is aab, matching the string prefix aab. In pattern+separator+text matching, any position whose Z-value equals the pattern length marks a full occurrence beginning in the text part.$explanation$,
    'advanced',
    3,
    4185,
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
  ('dsa.strings.searching.code_naive_trace', 'dsa.strings.searching', true),
  ('dsa.strings.searching.mc_method_constraints', 'dsa.strings.searching', true),
  ('dsa.strings.prefix_function.code_table_trace', 'dsa.strings.prefix_function', true),
  ('dsa.strings.hashing.mc_double_hash', 'dsa.strings.hashing', true),
  ('dsa.strings.z_function.code_table_trace', 'dsa.strings.z_function', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.strings.searching.mc_method_constraints.a', 'dsa.strings.searching.mc_method_constraints', 'KMP with a prefix table', true, 10),
  ('dsa.strings.searching.mc_method_constraints.b', 'dsa.strings.searching.mc_method_constraints', 'A single rolling hash with no verification', false, 20),
  ('dsa.strings.searching.mc_method_constraints.c', 'dsa.strings.searching.mc_method_constraints', 'A trie of all text suffixes built by hand for one pattern', false, 30),
  ('dsa.strings.searching.mc_method_constraints.d', 'dsa.strings.searching.mc_method_constraints', 'Naive search, because it uses no preprocessing', false, 40),
  ('dsa.strings.hashing.mc_double_hash.a', 'dsa.strings.hashing.mc_double_hash', 'It greatly lowers collision probability, but direct verification is still needed for absolute correctness', true, 10),
  ('dsa.strings.hashing.mc_double_hash.b', 'dsa.strings.hashing.mc_double_hash', 'It proves equal hash pairs are always equal strings', false, 20),
  ('dsa.strings.hashing.mc_double_hash.c', 'dsa.strings.hashing.mc_double_hash', 'It changes every substring comparison from O(1) to O(n)', false, 30),
  ('dsa.strings.hashing.mc_double_hash.d', 'dsa.strings.hashing.mc_double_hash', 'It removes the need to choose a base or modulus carefully', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
