// Reference solution for concurrency-producer-consumer.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <atomic>
#include <condition_variable>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>

// Run `producers` producer threads (each pushing the integers 1..items_each into
// a shared queue) and `consumers` consumer threads that pop and accumulate a
// shared total. Returns the total once everything is drained. Because every
// produced value is consumed exactly once, the total is deterministic:
//   producers * (items_each*(items_each+1)/2).
inline long long producer_consumer_total(int producers, int consumers, int items_each) {
  std::queue<long long> queue;
  std::mutex mutex;
  std::condition_variable cv;
  bool done = (producers == 0);
  std::atomic<long long> total{0};
  std::atomic<int> active_producers{producers};

  std::vector<std::thread> producer_threads;
  for (int p = 0; p < producers; ++p) {
    producer_threads.emplace_back([&, items_each]() {
      for (int i = 1; i <= items_each; ++i) {
        {
          std::lock_guard<std::mutex> lock(mutex);
          queue.push(i);
        }
        cv.notify_one();
      }
      if (active_producers.fetch_sub(1) == 1) {
        {
          std::lock_guard<std::mutex> lock(mutex);
          done = true;
        }
        cv.notify_all();
      }
    });
  }

  std::vector<std::thread> consumer_threads;
  for (int c = 0; c < consumers; ++c) {
    consumer_threads.emplace_back([&]() {
      for (;;) {
        std::unique_lock<std::mutex> lock(mutex);
        cv.wait(lock, [&]() { return !queue.empty() || done; });
        if (queue.empty()) {
          return;  // done and fully drained
        }
        const long long value = queue.front();
        queue.pop();
        lock.unlock();
        total.fetch_add(value);
      }
    });
  }

  for (std::thread& t : producer_threads) {
    t.join();
  }
  for (std::thread& t : consumer_threads) {
    t.join();
  }
  return total.load();
}
