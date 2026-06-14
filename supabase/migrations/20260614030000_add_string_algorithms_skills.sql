-- Roadmap #79 / #120 (string algorithms): prefix function/KMP table, tries,
-- and string hashing (rolling hash).
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.strings.prefix_function',
    'dsa',
    'dsa.strings',
    'Prefix function and KMP table',
    'Build and read the prefix-function (failure) table that powers KMP.',
    'Compute the prefix function for a pattern and explain how KMP uses it to skip work.',
    'advanced',
    array['lesson', 'quiz'],
    1950
  ),
  (
    'dsa.strings.trie',
    'dsa',
    'dsa.strings',
    'Tries (prefix trees)',
    'Store a set of strings in a trie for fast prefix and dictionary queries.',
    'Use a trie for prefix/autocomplete lookups and weigh its memory cost against a hash map.',
    'advanced',
    array['lesson', 'quiz'],
    1960
  ),
  (
    'dsa.strings.hashing',
    'dsa',
    'dsa.strings',
    'String hashing and rolling hash',
    'Compare substrings in O(1) with a rolling hash, mindful of collisions.',
    'Use a rolling hash (Rabin-Karp) for substring equality and guard against collisions.',
    'advanced',
    array['lesson', 'quiz'],
    1970
  )
on conflict (id) do update
set
  domain = excluded.domain,
  module_id = excluded.module_id,
  title = excluded.title,
  description = excluded.description,
  learner_goal = excluded.learner_goal,
  level = excluded.level,
  item_types = excluded.item_types,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.skill_prerequisites (skill_id, prerequisite_skill_id, relationship_type)
values
  ('dsa.strings.prefix_function', 'dsa.strings.searching', 'recommended'),
  ('dsa.strings.trie', 'dsa.strings.manipulation', 'recommended'),
  ('dsa.strings.hashing', 'dsa.strings.searching', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
