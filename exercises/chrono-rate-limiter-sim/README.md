# Utilities: rate limiter simulation

**Skills:** chrono/time modeling, sliding window, traversal
· **Difficulty:** intermediate · **~30 min**

Simulate a sliding-window rate limiter over injected timestamps (deterministic —
no real clock).

## Requirements

- `times` are request timestamps in milliseconds, non-decreasing.
- A request is **allowed** when fewer than `max_requests` have already been
  allowed within the last `window` ms. Only allowed requests count.
- A timestamp `t'` is "within the window" of `t` when `t' > t - window`.
- Return one bool per request (true = allowed, false = throttled).

A deque of allowed timestamps makes a clean sliding window.

Edit only `rate_limiter.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh chrono-rate-limiter-sim
# ...edit exercises/chrono-rate-limiter-sim/work/rate_limiter.hpp...
scripts/exercises/test.sh chrono-rate-limiter-sim
scripts/exercises/reset.sh chrono-rate-limiter-sim
```

When all tests pass, mark the exercise complete in cppFan.
