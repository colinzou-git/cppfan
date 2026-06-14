-- Roadmap #83 / #122 (math depth): bitmask techniques, prime sieve/factorization,
-- and modular arithmetic with binary exponentiation.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.math.bitmask_techniques',
    'dsa',
    'dsa.math',
    'Bitmask techniques',
    'Use an integer as a set of flags: test/set/clear bits, popcount, and enumerate subsets.',
    'Treat an int as a bitset for membership and iterate over all subsets of a mask.',
    'advanced',
    array['lesson', 'quiz'],
    2050
  ),
  (
    'dsa.math.sieve',
    'dsa',
    'dsa.math',
    'Primes: sieve and factorization',
    'Find primes with the sieve of Eratosthenes and factor numbers by trial division.',
    'Precompute primes with a sieve and factor an integer, choosing the right method by size.',
    'advanced',
    array['lesson', 'quiz'],
    2060
  ),
  (
    'dsa.math.modular_arithmetic',
    'dsa',
    'dsa.math',
    'Modular arithmetic and fast power',
    'Compute under a modulus without overflow, using binary exponentiation and modular inverse.',
    'Apply modular add/multiply safely and compute a^b mod m with binary exponentiation.',
    'advanced',
    array['lesson', 'quiz'],
    2070
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
  ('dsa.math.bitmask_techniques', 'dsa.math.bit_manipulation', 'recommended'),
  ('dsa.math.sieve', 'dsa.math.number_theory', 'recommended'),
  ('dsa.math.modular_arithmetic', 'dsa.math.number_theory', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
