// Tests for concurrency-task-queue. Build with -I _harness and the implementation dir.
#include "bounded_task_queue.hpp"
#include "check.hpp"

#include <algorithm>
#include <atomic>
#include <future>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

static void test_fifo_single_thread() {
  BoundedTaskQueue queue(3);

  CHECK(queue.capacity() == 3);
  CHECK(queue.push({1, "parse"}));
  CHECK(queue.push({2, "render"}));
  CHECK(queue.size() == 2);

  auto first = queue.pop();
  auto second = queue.pop();
  CHECK(first.has_value());
  CHECK(second.has_value());
  if (first.has_value()) {
    CHECK(first->id == 1);
    CHECK(first->payload == "parse");
  }
  if (second.has_value()) {
    CHECK(second->id == 2);
    CHECK(second->payload == "render");
  }
}

static void test_close_rejects_new_work_and_drains_existing() {
  BoundedTaskQueue queue(2);
  CHECK(queue.push({7, "before-close"}));
  queue.close();

  CHECK(queue.closed());
  CHECK(!queue.push({8, "after-close"}));

  auto drained = queue.pop();
  auto done = queue.pop();
  CHECK(drained.has_value());
  if (drained.has_value()) {
    CHECK(drained->id == 7);
  }
  CHECK(!done.has_value());
}

static void test_blocked_consumer_gets_pushed_task_without_sleep() {
  BoundedTaskQueue queue(1);
  std::promise<void> consumer_started;
  std::future<void> started = consumer_started.get_future();
  std::optional<Task> result;

  std::thread consumer([&] {
    consumer_started.set_value();
    result = queue.pop();
  });

  started.wait();
  CHECK(queue.push({42, "delivered"}));
  consumer.join();

  CHECK(result.has_value());
  if (result.has_value()) {
    CHECK(result->id == 42);
    CHECK(result->payload == "delivered");
  }
}

static void test_multiple_producers_consumers_exactly_once() {
  constexpr int producerCount = 4;
  constexpr int consumerCount = 3;
  constexpr int tasksPerProducer = 50;
  constexpr int totalTasks = producerCount * tasksPerProducer;

  BoundedTaskQueue queue(16);
  std::atomic<int> pushed = 0;
  std::atomic<int> popped = 0;
  std::vector<int> seen(totalTasks, 0);
  std::mutex seenMutex;
  std::vector<std::thread> consumers;

  for (int c = 0; c < consumerCount; ++c) {
    consumers.emplace_back([&] {
      while (true) {
        auto task = queue.pop();
        if (!task.has_value()) {
          return;
        }
        {
          std::lock_guard<std::mutex> lock(seenMutex);
          if (task->id >= 0 && task->id < totalTasks) {
            seen[task->id] += 1;
          }
        }
        popped.fetch_add(1, std::memory_order_relaxed);
      }
    });
  }

  std::vector<std::thread> producers;
  for (int p = 0; p < producerCount; ++p) {
    producers.emplace_back([&, p] {
      for (int i = 0; i < tasksPerProducer; ++i) {
        const int id = p * tasksPerProducer + i;
        if (queue.push({id, "task"})) {
          pushed.fetch_add(1, std::memory_order_relaxed);
        }
      }
    });
  }

  for (auto& producer : producers) {
    producer.join();
  }
  queue.close();
  for (auto& consumer : consumers) {
    consumer.join();
  }

  CHECK(pushed.load(std::memory_order_relaxed) == totalTasks);
  CHECK(popped.load(std::memory_order_relaxed) == totalTasks);
  CHECK(std::all_of(seen.begin(), seen.end(), [](int count) { return count == 1; }));
  CHECK(queue.size() == 0);
}

int main() {
  test_fifo_single_thread();
  test_close_rejects_new_work_and_drains_existing();
  test_blocked_consumer_gets_pushed_task_without_sleep();
  test_multiple_producers_consumers_exactly_once();
  return REPORT();
}
