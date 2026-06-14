-- Roadmap #79 / #120 (strings, fundamentals slice): character traversal and
-- frequency counting, substring vs subsequence, and character classes / case
-- handling. Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.strings.char_frequency',
    'dsa',
    'dsa.strings',
    'Character traversal and frequency counting',
    'Walk a string character by character and tally counts with a fixed array or a hash map.',
    'Build a character frequency table and pick a fixed array vs a hash map for the alphabet.',
    'beginner',
    array['lesson', 'quiz'],
    1902
  ),
  (
    'dsa.strings.substring_subsequence',
    'dsa',
    'dsa.strings',
    'Substring vs subsequence',
    'Distinguish a contiguous substring from an order-preserving subsequence and their counts.',
    'Tell a substring (contiguous) from a subsequence (order-preserving, possibly gapped) and count each.',
    'beginner',
    array['lesson', 'quiz'],
    1904
  ),
  (
    'dsa.strings.case_handling',
    'dsa',
    'dsa.strings',
    'Character classes and case handling',
    'Classify characters and change case safely with <cctype>, avoiding the negative-char trap.',
    'Use <cctype> functions correctly (cast to unsigned char) for classification and case folding.',
    'beginner',
    array['lesson', 'quiz'],
    1906
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
  ('dsa.strings.char_frequency', 'dsa.strings.manipulation', 'recommended'),
  ('dsa.strings.substring_subsequence', 'dsa.strings.manipulation', 'recommended'),
  ('dsa.strings.case_handling', 'dsa.strings.char_frequency', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
