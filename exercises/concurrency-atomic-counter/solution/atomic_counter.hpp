// Reference solution for concurrency-atomic-counter.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <atomic>
#include <thread>
#include <vector>

// Spawn num_threads threads that each increment a shared std::atomic<long long>
// per_thread times, then join them. Because the counter is atomic there are no
// lost updates, so the result is exactly num_threads * per_thread.
inline long long concurrent_increment(int num_threads, int per_thread) {
  std::atomic<long long> counter{0};
  std::vector<std::thread> workers;
  workers.reserve(static_cast<std::size_t>(num_threads < 0 ? 0 : num_threads));
  for (int t = 0; t < num_threads; ++t) {
    workers.emplace_back([&counter, per_thread]() {
      for (int i = 0; i < per_thread; ++i) {
        counter.fetch_add(1, std::memory_order_relaxed);
      }
    });
  }
  for (std::thread& worker : workers) {
    worker.join();
  }
  return counter.load();
}
