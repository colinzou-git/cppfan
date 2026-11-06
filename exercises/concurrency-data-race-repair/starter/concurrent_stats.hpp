#pragma once
#include <algorithm>
#include <mutex>
#include <thread>
#include <vector>

struct ConcurrentStats {
  long long count = 0;
  long long sum = 0;
};

inline ConcurrentStats parallel_stats(const std::vector<int>& values, int workers) {
  // TODO: spawn workers, protect BOTH shared fields with the same mutex, join.
  (void)values;
  (void)workers;
  return {};
}
