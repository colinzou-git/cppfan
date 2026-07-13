// Reference solution for chrono-rate-limiter-sim.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <deque>
#include <vector>

// Sliding-window rate limiter over injected timestamps (milliseconds, non-
// decreasing). A request is allowed when fewer than max_requests have been
// allowed within the last `window` ms; only allowed requests count toward the
// limit. Returns one bool per request.
inline std::vector<bool> rate_limit(const std::vector<long long>& times, int max_requests,
                                    long long window) {
  std::vector<bool> result;
  result.reserve(times.size());
  std::deque<long long> allowed;
  for (long long t : times) {
    while (!allowed.empty() && allowed.front() <= t - window) {
      allowed.pop_front();
    }
    if (static_cast<int>(allowed.size()) < max_requests) {
      allowed.push_back(t);
      result.push_back(true);
    } else {
      result.push_back(false);
    }
  }
  return result;
}
