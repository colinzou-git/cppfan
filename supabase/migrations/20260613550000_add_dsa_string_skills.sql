-- Roadmap #65 / #79 (stage 10): string manipulation, searching, palindromes, parsing.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.strings.manipulation',
    'dsa',
    'dsa.strings',
    'String manipulation',
    'Build and transform strings efficiently, avoiding hidden copies.',
    'Concatenate, slice, and mutate strings without accidental O(n^2) cost.',
    'intermediate',
    array['lesson', 'quiz'],
    1910
  ),
  (
    'dsa.strings.searching',
    'dsa',
    'dsa.strings',
    'Substring search',
    'Find a pattern inside text with naive scanning or KMP.',
    'Compare naive O(nm) search with linear-time KMP and know when each matters.',
    'advanced',
    array['lesson', 'quiz'],
    1920
  ),
  (
    'dsa.strings.palindrome',
    'dsa',
    'dsa.strings',
    'Palindromes and anagrams',
    'Check palindromes with two pointers and anagrams with frequency counts.',
    'Use two pointers for palindromes and character counts for anagrams.',
    'intermediate',
    array['lesson', 'quiz'],
    1930
  ),
  (
    'dsa.strings.parsing',
    'dsa',
    'dsa.strings',
    'Tokenizing and parsing',
    'Split text into tokens and parse structured input.',
    'Split a string on delimiters and parse fields from a line of input.',
    'intermediate',
    array['lesson', 'quiz'],
    1940
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
  ('dsa.strings.manipulation', 'cpp.stl.string', 'recommended'),
  ('dsa.strings.searching', 'dsa.strings.manipulation', 'recommended'),
  ('dsa.strings.palindrome', 'dsa.arrays.two_pointers', 'recommended'),
  ('dsa.strings.parsing', 'dsa.strings.manipulation', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
