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
  ConcurrentStats result;
  if (workers <= 0 || values.empty()) return result;
  const int actual = std::min(workers, static_cast<int>(values.size()));
  std::mutex mutex;
  std::vector<std::thread> threads;
  threads.reserve(actual);
  for (int t = 0; t < actual; ++t) {
    threads.emplace_back([&, t] {
      long long localCount = 0;
      long long localSum = 0;
      for (std::size_t i = static_cast<std::size_t>(t); i < values.size(); i += actual) {
        ++localCount;
        localSum += values[i];
      }
      std::lock_guard<std::mutex> lock(mutex);
      result.count += localCount;
      result.sum += localSum;
    });
  }
  for (auto& thread : threads) thread.join();
  return result;
}
