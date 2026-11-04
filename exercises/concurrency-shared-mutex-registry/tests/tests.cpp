#include "check.hpp"
#include "shared_registry.hpp"
#include <atomic>
#include <thread>
#include <vector>

static void test_empty_lookup() {
  SharedRegistry registry;
  CHECK(!registry.get(42).has_value());
  CHECK(registry.size() == 0);
}
static void test_insert_and_replace() {
  SharedRegistry registry;
  registry.put(7, "first");
  registry.put(7, "second");
  CHECK(registry.size() == 1);
  CHECK(registry.get(7) == std::optional<std::string>("second"));
}
static void test_distinct_concurrent_writers() {
  SharedRegistry registry;
  std::vector<std::thread> threads;
  for (int t = 0; t < 4; ++t) {
    threads.emplace_back([&, t] {
      for (int k = 0; k < 100; ++k) registry.put(t * 100 + k, "value");
    });
  }
  for (auto& thread : threads) thread.join();
  CHECK(registry.size() == 400);
  CHECK(registry.get(399) == std::optional<std::string>("value"));
}
static void test_concurrent_readers_copy_values() {
  SharedRegistry registry;
  registry.put(1, "stable");
  std::atomic<bool> ok{true};
  std::vector<std::thread> readers;
  for (int i = 0; i < 8; ++i) {
    readers.emplace_back([&] {
      for (int k = 0; k < 100; ++k) {
        if (registry.get(1) != std::optional<std::string>("stable")) ok.store(false);
      }
    });
  }
  for (auto& thread : readers) thread.join();
  CHECK(ok.load());
}
static void test_copy_survives_replacement() {
  SharedRegistry registry;
  registry.put(4, "before");
  auto copy = registry.get(4);
  registry.put(4, "after");
  CHECK(copy == std::optional<std::string>("before"));
  CHECK(registry.get(4) == std::optional<std::string>("after"));
}
int main() {
  test_empty_lookup();
  test_insert_and_replace();
  test_distinct_concurrent_writers();
  test_concurrent_readers_copy_values();
  test_copy_survives_replacement();
  return REPORT();
}
