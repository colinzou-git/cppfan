-- Roadmap #83 / #122 (math depth): learning items for bitmask techniques, prime
-- sieve/factorization, and modular arithmetic with binary exponentiation.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.math.bitmask_techniques.lesson',
    'lesson',
    'Bitmask techniques',
    'An integer can act as a set of up to ~64 boolean flags, one per bit, which is both compact and fast. The core operations on bit i are: test `(mask >> i) & 1`, set `mask |= (1 << i)`, clear `mask &= ~(1 << i)`, and toggle `mask ^= (1 << i)`. Two everyday tricks: `n & (n - 1)` clears the lowest set bit (so `n && !(n & (n - 1))` tests for a power of two), and `__builtin_popcount(mask)` (or `std::popcount` in C++20) counts the set bits. The big payoff is subset enumeration: to iterate every subset of a mask, run `for (int s = mask; s; s = (s - 1) & mask)`, which visits each submask exactly once — the engine behind bitmask DP over subsets. Use `1 << i` carefully: for masks wider than 31 bits use `1LL << i` to avoid int overflow. Bitmasks shine when the universe is small (n <= ~20-22 for 2^n subset DP) and you need set operations as single CPU instructions.',
    'Treat an int as flags: test/set/clear/toggle bit i with >>/|/&~/^. n & (n-1) clears the lowest set bit (power-of-two test); popcount counts bits; iterate submasks with for (s = mask; s; s = (s-1) & mask). Use 1LL << i past 31 bits.',
    'advanced',
    6,
    4050,
    true
  ),
  (
    'dsa.math.bitmask_techniques.mc_submask',
    'multiple_choice',
    'Enumerating submasks',
    'Which loop visits every subset (submask) of the bits set in `mask` exactly once?',
    '`for (int s = mask; s; s = (s - 1) & mask)` walks all non-empty submasks of mask exactly once (add s = 0 separately for the empty set). The (s - 1) & mask step skips bits not in mask.',
    'advanced',
    2,
    4060,
    true
  ),
  (
    'dsa.math.sieve.lesson',
    'lesson',
    'Primes: sieve and factorization',
    'To test one number n for primality, trial division up to sqrt(n) is enough — if n has a factor larger than sqrt(n) it must also have one smaller, so you never look past the square root; this is O(sqrt(n)). To get all primes up to N, the sieve of Eratosthenes is far better: mark multiples of each prime starting from p*p as composite, leaving the primes, in O(N log log N) time and O(N) space. Prime factorization combines the ideas: divide out each prime factor (2, then odd numbers up to sqrt(n)) repeatedly, and whatever remains above 1 at the end is a final prime factor — O(sqrt(n)) per number, or much faster if you precompute a smallest-prime-factor table with a sieve. Pick by workload: sqrt(n) trial division for a few queries, a sieve when you need many primality checks or factorizations over a range. Watch the bound — multiplying near the limit can overflow, so use a 64-bit type when squaring.',
    'Trial division to sqrt(n) tests one number (O(sqrt n)); the sieve of Eratosthenes lists all primes up to N in O(N log log N). Factor by dividing out primes up to sqrt(n); a smallest-prime-factor sieve makes repeated factorization fast.',
    'advanced',
    6,
    4070,
    true
  ),
  (
    'dsa.math.sieve.mc_trial',
    'multiple_choice',
    'How far to trial divide',
    'When testing whether a single number n is prime by trial division, up to what value must you check for divisors?',
    'You only need to test divisors up to sqrt(n): any factor larger than sqrt(n) is paired with one smaller than sqrt(n), so if none exist up to the square root, n is prime. This makes the check O(sqrt(n)).',
    'advanced',
    2,
    4080,
    true
  ),
  (
    'dsa.math.modular_arithmetic.lesson',
    'lesson',
    'Modular arithmetic and fast power',
    'Modular arithmetic keeps numbers small by working with remainders mod m, which is essential when answers would overflow (problems often ask for a result mod 1e9+7). Addition and multiplication distribute over the modulus: `(a + b) % m` and `(a * b) % m` give the right answer, but reduce after every operation, and use a 64-bit type for the product because `a * b` can overflow `int` even when a and b are reduced. Subtraction needs care: `(a - b) % m` can be negative in C++, so write `((a - b) % m + m) % m` to get a value in [0, m). To compute a^b mod m efficiently, use binary exponentiation (exponentiation by squaring): square the base and halve the exponent, multiplying the result in when the current bit is set — O(log b) multiplications instead of O(b). When m is prime, the modular inverse of a is a^(m-2) mod m by Fermat''s little theorem, which lets you ''divide'' under a modulus. Always state the modulus and use 64-bit intermediates to stay overflow-safe.',
    'Reduce mod m after each + and *, using 64-bit products to avoid overflow; fix negative subtraction with ((a-b)%m+m)%m. Compute a^b mod m in O(log b) by binary exponentiation; for prime m the inverse is a^(m-2) mod m (Fermat).',
    'advanced',
    7,
    4090,
    true
  ),
  (
    'dsa.math.modular_arithmetic.mc_fastpow',
    'multiple_choice',
    'Computing a^b mod m efficiently',
    'What is the standard way to compute a^b mod m quickly for a large exponent b?',
    'Binary exponentiation (exponentiation by squaring) computes a^b mod m in O(log b) multiplications by squaring the base and halving the exponent, reducing mod m at each step. A plain loop multiplying b times is O(b) and far too slow for large b.',
    'advanced',
    2,
    4100,
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
  ('dsa.math.bitmask_techniques.lesson', 'dsa.math.bitmask_techniques', true),
  ('dsa.math.bitmask_techniques.mc_submask', 'dsa.math.bitmask_techniques', true),
  ('dsa.math.sieve.lesson', 'dsa.math.sieve', true),
  ('dsa.math.sieve.mc_trial', 'dsa.math.sieve', true),
  ('dsa.math.modular_arithmetic.lesson', 'dsa.math.modular_arithmetic', true),
  ('dsa.math.modular_arithmetic.mc_fastpow', 'dsa.math.modular_arithmetic', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.math.bitmask_techniques.mc_submask.a', 'dsa.math.bitmask_techniques.mc_submask', 'for (int s = mask; s; s = (s - 1) & mask)', true, 10),
  ('dsa.math.bitmask_techniques.mc_submask.b', 'dsa.math.bitmask_techniques.mc_submask', 'for (int s = 0; s < mask; ++s)', false, 20),
  ('dsa.math.bitmask_techniques.mc_submask.c', 'dsa.math.bitmask_techniques.mc_submask', 'for (int s = mask; s; s >>= 1)', false, 30),
  ('dsa.math.bitmask_techniques.mc_submask.d', 'dsa.math.bitmask_techniques.mc_submask', 'for (int s = mask; s; s = s & (s + 1))', false, 40),
  ('dsa.math.sieve.mc_trial.a', 'dsa.math.sieve.mc_trial', 'Up to sqrt(n)', true, 10),
  ('dsa.math.sieve.mc_trial.b', 'dsa.math.sieve.mc_trial', 'Up to n - 1', false, 20),
  ('dsa.math.sieve.mc_trial.c', 'dsa.math.sieve.mc_trial', 'Up to n / 2 only', false, 30),
  ('dsa.math.sieve.mc_trial.d', 'dsa.math.sieve.mc_trial', 'Up to log(n)', false, 40),
  ('dsa.math.modular_arithmetic.mc_fastpow.a', 'dsa.math.modular_arithmetic.mc_fastpow', 'Binary exponentiation (square the base, halve the exponent): O(log b)', true, 10),
  ('dsa.math.modular_arithmetic.mc_fastpow.b', 'dsa.math.modular_arithmetic.mc_fastpow', 'Multiply a by itself in a loop b times: O(b)', false, 20),
  ('dsa.math.modular_arithmetic.mc_fastpow.c', 'dsa.math.modular_arithmetic.mc_fastpow', 'Use std::pow(a, b) and take the result mod m', false, 30),
  ('dsa.math.modular_arithmetic.mc_fastpow.d', 'dsa.math.modular_arithmetic.mc_fastpow', 'Factor b into primes first', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
