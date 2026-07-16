# Math: count primes below n

Return the number of prime numbers **strictly less than** `n`.

Implement `count_primes` in `count_primes.hpp`:

```cpp
int count_primes(int n);
```

Approach — Sieve of Eratosthenes (O(n log log n)):
- Numbers below 2 have zero primes.
- Mark multiples of each prime as composite, starting at `p*p` (smaller multiples
  are already marked). Only sieve while `p*p < n`.
- Count the values in `[2, n)` that remain marked prime.

Examples: `count_primes(10)` → `4` (2, 3, 5, 7); `count_primes(100)` → `25`.

Only edit `count_primes.hpp`. Do not change the interface or the tests.
