-- Roadmap #79 / #120 (strings, second slice): Z-function, palindromic substrings
-- (expand around center), and parsing edge cases.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.strings.z_function',
    'dsa',
    'dsa.strings',
    'Z-function',
    'Compute the Z-array of longest prefix matches and use it for pattern matching.',
    'Read a Z-array and use the pattern+separator+text trick to find all matches.',
    'advanced',
    array['lesson', 'quiz'],
    1980
  ),
  (
    'dsa.strings.palindrome_substrings',
    'dsa',
    'dsa.strings',
    'Palindromic substrings',
    'Find and count palindromic substrings by expanding around centers.',
    'Use expand-around-center to find the longest/all palindromic substrings in O(n^2).',
    'advanced',
    array['lesson', 'quiz'],
    1990
  ),
  (
    'dsa.strings.parsing_edge_cases',
    'dsa',
    'dsa.strings',
    'Parsing edge cases',
    'Handle empty fields, trailing delimiters, whitespace, and CRLF when tokenizing.',
    'Parse delimited input robustly: preserve empty fields and strip CR/whitespace.',
    'intermediate',
    array['lesson', 'quiz'],
    2000
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
  ('dsa.strings.z_function', 'dsa.strings.prefix_function', 'recommended'),
  ('dsa.strings.palindrome_substrings', 'dsa.strings.palindrome', 'recommended'),
  ('dsa.strings.parsing_edge_cases', 'dsa.strings.parsing', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
