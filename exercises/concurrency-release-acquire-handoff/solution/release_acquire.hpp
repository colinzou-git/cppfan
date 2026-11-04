#pragma once
#include <atomic>
#include <thread>
#include <vector>

inline std::vector<int> release_acquire_handoff(int n) {
  if (n <= 0) return {};
  std::vector<int> payload;
  std::vector<int> observed;
  std::atomic<bool> ready{false};

  std::thread consumer([&] {
    while (!ready.load(std::memory_order_acquire)) std::this_thread::yield();
    observed = payload;
  });
  std::thread producer([&] {
    payload.reserve(static_cast<std::size_t>(n));
    for (int i = 0; i < n; ++i) payload.push_back(i * 3 + 1);
    ready.store(true, std::memory_order_release);
  });
  producer.join();
  consumer.join();
  return observed;
}
