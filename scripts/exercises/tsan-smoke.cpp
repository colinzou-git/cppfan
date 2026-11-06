// Intentionally racy TSan proof fixture (#707) — NEVER a learner/reference solution.
#include <atomic>
#include <thread>

int main() {
  int shared = 0;
  std::atomic<bool> begin{false};
  auto worker = [&] {
    while (!begin.load(std::memory_order_acquire)) {}
    for (int i = 0; i < 1000; ++i) ++shared;  // deliberately unsynchronized
  };
  std::thread a(worker);
  std::thread b(worker);
  begin.store(true, std::memory_order_release);
  a.join();
  b.join();
  return 0;
}
