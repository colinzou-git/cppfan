// Exercise: concurrency-atomic-counter
// Increment a shared counter from many threads without losing updates.
//
// Rules:
//  - Spawn num_threads threads; each increments a SHARED counter per_thread times.
//  - Join all threads, then return the final value.
//  - Use std::atomic so concurrent increments cannot race — the result must be
//    exactly num_threads * per_thread every time.
//  - num_threads == 0 returns 0.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <atomic>
#include <thread>
#include <vector>

inline long long concurrent_increment(int num_threads, int per_thread) {
  // TODO: launch num_threads threads incrementing one std::atomic counter
  // per_thread times each; join them and return the total.
  (void)num_threads;
  (void)per_thread;
  return 0;
}
