#pragma once
#include <atomic>
#include <condition_variable>
#include <mutex>
#include <stop_token>
#include <thread>
#include <vector>

inline int count_cooperative_stops(int workers) {
  if (workers <= 0) return 0;
  std::atomic<int> stopped{0};
  std::mutex mutex;
  std::condition_variable_any cv;
  std::vector<std::jthread> threads;
  threads.reserve(workers);
  for (int i = 0; i < workers; ++i) {
    threads.emplace_back([&](std::stop_token token) {
      std::unique_lock<std::mutex> lock(mutex);
      cv.wait(lock, token, [] { return false; });
      if (token.stop_requested()) stopped.fetch_add(1, std::memory_order_relaxed);
    });
  }
  for (auto& thread : threads) thread.request_stop();
  for (auto& thread : threads) thread.join();
  return stopped.load();
}
