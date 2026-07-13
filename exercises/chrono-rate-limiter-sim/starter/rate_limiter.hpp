// Exercise: chrono-rate-limiter-sim
// Simulate a sliding-window rate limiter over injected timestamps.
//
// Rules:
//  - times are request timestamps in milliseconds, non-decreasing. (No real
//    clock — the timestamps are given, so the result is deterministic.)
//  - A request is ALLOWED when fewer than max_requests have already been allowed
//    within the last `window` ms. Only allowed requests count toward the limit.
//  - A timestamp t' counts as "within the window" of t when t' > t - window.
//  - Return one bool per request (true = allowed, false = throttled).
//
// A deque of allowed timestamps is a clean sliding window: evict from the front
// once entries fall out of the window.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<bool> rate_limit(const std::vector<long long>& times, int max_requests,
                                    long long window) {
  // TODO: sliding window over allowed timestamps; allow while the window holds
  // fewer than max_requests.
  (void)times;
  (void)max_requests;
  (void)window;
  return {};
}
