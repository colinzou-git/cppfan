#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[2]
EXERCISES = ROOT / "exercises"
CATALOG = ROOT / "src/features/exercises/exercise-catalog.ts"
CONFIGS = ROOT / "src/features/code-lab/exercise-code-lab-configs.ts"
DOC_WRITE = ROOT / "docs/WRITE_CODE_EXERCISES.md"
DOC_COVERAGE = ROOT / "docs/EXERCISE_CATALOG_COVERAGE.md"
UNIT = ROOT / "tests/unit/concurrency-exercises.test.ts"
E2E = ROOT / "tests/e2e/concurrency-exercises.spec.ts"

SPECS = [
    {
        "id": "concurrency-data-race-repair",
        "title": "Concurrency: repair a shared statistics invariant",
        "file": "shared_stats.hpp",
        "skills": ["cpp.concurrency.data_races", "cpp.concurrency.mutexes", "cpp.concurrency.shared_state_design"],
        "minutes": 35,
        "tests": ["test_single_thread_snapshot", "test_multiple_workers_preserve_invariant", "test_repeated_recording"],
        "hints": [
            "Treat count and total as one invariant; protect them with the same mutex.",
            "Keep the lock for the complete record() update, not just one field.",
            "snapshot() should lock and return a value copy so callers do not retain unprotected references."
        ],
        "solution": r'''#pragma once
#include <mutex>

struct StatsSnapshot {
  int count;
  long long total;
};

class SharedStats {
 public:
  void record(int amount) {
    std::lock_guard<std::mutex> lock(mutex_);
    ++count_;
    total_ += amount;
  }

  StatsSnapshot snapshot() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return {count_, total_};
  }

 private:
  mutable std::mutex mutex_;
  int count_{0};
  long long total_{0};
};
''',
        "starter": r'''#pragma once
#include <mutex>

struct StatsSnapshot {
  int count;
  long long total;
};

class SharedStats {
 public:
  void record(int amount) {
    // TODO: protect count_ and total_ as one invariant with the same mutex.
    ++count_;
    total_ += amount;
  }

  StatsSnapshot snapshot() const {
    // TODO: return a consistent value snapshot while holding the mutex.
    return {count_, total_};
  }

 private:
  mutable std::mutex mutex_;
  int count_{0};
  long long total_{0};
};
''',
        "test_source": r'''#include "shared_stats.hpp"
#include "check.hpp"
#include <thread>
#include <vector>

static void test_single_thread_snapshot() {
  SharedStats stats;
  stats.record(3);
  stats.record(7);
  const auto snap = stats.snapshot();
  CHECK(snap.count == 2);
  CHECK(snap.total == 10);
}

static void test_multiple_workers_preserve_invariant() {
  SharedStats stats;
  constexpr int workers = 6;
  constexpr int records = 400;
  std::vector<std::thread> threads;
  for (int w = 0; w < workers; ++w) {
    threads.emplace_back([&] {
      for (int i = 0; i < records; ++i) stats.record(2);
    });
  }
  for (auto& thread : threads) thread.join();
  const auto snap = stats.snapshot();
  CHECK(snap.count == workers * records);
  CHECK(snap.total == 2LL * workers * records);
}

static void test_repeated_recording() {
  SharedStats stats;
  for (int round = 0; round < 5; ++round) {
    std::vector<std::thread> threads;
    for (int w = 0; w < 4; ++w) {
      threads.emplace_back([&] {
        for (int i = 0; i < 100; ++i) stats.record(1);
      });
    }
    for (auto& thread : threads) thread.join();
    const auto snap = stats.snapshot();
    CHECK(snap.count == (round + 1) * 400);
    CHECK(snap.total == snap.count);
  }
}

int main() {
  test_single_thread_snapshot();
  test_multiple_workers_preserve_invariant();
  test_repeated_recording();
  return REPORT();
}
''',
        "readme": "Repair a shared statistics object so `count` and `total` are always observed as one consistent invariant. Use one mutex and RAII locking; do not make the fields independently atomic.",
        "lab_prompt": "Implement a thread-safe SharedStats. Read worker count, records per worker, and amount. Run the workers and print final `count total`. Protect both fields with one mutex so every snapshot is consistent.",
        "lab_starter": r'''#include <iostream>
#include <mutex>
#include <thread>
#include <vector>
using namespace std;

class SharedStats {
 public:
  void record(int amount) {
    // TODO: lock m_ and update both fields in one critical section.
    (void)amount;
  }
  pair<int,long long> snapshot() const {
    // TODO: lock and return a value copy.
    return {count_, total_};
  }
 private:
  mutable mutex m_;
  int count_{0};
  long long total_{0};
};

int main() {
  int workers, records, amount;
  cin >> workers >> records >> amount;
  SharedStats stats;
  vector<thread> ts;
  for (int w = 0; w < workers; ++w) ts.emplace_back([&] { for (int i = 0; i < records; ++i) stats.record(amount); });
  for (auto& t : ts) t.join();
  auto [count,total] = stats.snapshot();
  cout << count << " " << total << "\n";
}
''',
        "lab_stdin": "4 100 2\n",
        "visible": [("Four workers", "4 100 2\n", "400 800\n"), ("One worker", "1 3 5\n", "3 15\n")]
    },
    {
        "id": "concurrency-deadlock-safe-transfer",
        "title": "Concurrency: deadlock-safe account transfer",
        "file": "bank_transfer.hpp",
        "skills": ["cpp.concurrency.deadlock", "cpp.concurrency.mutexes", "cpp.concurrency.lock_granularity"],
        "minutes": 40,
        "tests": ["test_basic_transfer", "test_insufficient_and_self_transfer", "test_opposite_direction_transfers_preserve_total"],
        "hints": [
            "Handle self-transfer before attempting to lock the same mutex twice.",
            "Acquire both account mutexes together with std::scoped_lock (or one globally consistent order).",
            "Check the source balance only after both accounts are protected."
        ],
        "solution": r'''#pragma once
#include <mutex>

struct Account {
  mutable std::mutex mutex;
  long long balance;
  explicit Account(long long initial) : balance(initial) {}
};

inline bool transfer(Account& from, Account& to, long long amount) {
  if (amount <= 0) return false;
  if (&from == &to) return true;
  std::scoped_lock lock(from.mutex, to.mutex);
  if (from.balance < amount) return false;
  from.balance -= amount;
  to.balance += amount;
  return true;
}
''',
        "starter": r'''#pragma once
#include <mutex>

struct Account {
  mutable std::mutex mutex;
  long long balance;
  explicit Account(long long initial) : balance(initial) {}
};

inline bool transfer(Account& from, Account& to, long long amount) {
  // TODO: validate amount/self-transfer, then acquire both mutexes without a lock-order cycle.
  (void)from; (void)to; (void)amount;
  return false;
}
''',
        "test_source": r'''#include "bank_transfer.hpp"
#include "check.hpp"
#include <thread>

static long long total(Account& a, Account& b) {
  std::scoped_lock lock(a.mutex, b.mutex);
  return a.balance + b.balance;
}

static void test_basic_transfer() {
  Account a(100), b(50);
  CHECK(transfer(a, b, 30));
  std::scoped_lock lock(a.mutex, b.mutex);
  CHECK(a.balance == 70);
  CHECK(b.balance == 80);
}

static void test_insufficient_and_self_transfer() {
  Account a(10), b(5);
  CHECK(!transfer(a, b, 11));
  CHECK(transfer(a, a, 3));
  CHECK(!transfer(a, b, 0));
  CHECK(total(a, b) == 15);
}

static void test_opposite_direction_transfers_preserve_total() {
  Account a(1000), b(1000);
  std::thread left([&] { for (int i = 0; i < 1000; ++i) CHECK(transfer(a, b, 1)); });
  std::thread right([&] { for (int i = 0; i < 1000; ++i) CHECK(transfer(b, a, 1)); });
  left.join();
  right.join();
  CHECK(total(a, b) == 2000);
  std::scoped_lock lock(a.mutex, b.mutex);
  CHECK(a.balance == 1000);
  CHECK(b.balance == 1000);
}

int main() {
  test_basic_transfer();
  test_insufficient_and_self_transfer();
  test_opposite_direction_transfers_preserve_total();
  return REPORT();
}
''',
        "readme": "Implement transfers between two independently locked accounts without creating an A→B / B→A deadlock. Preserve total balance and define self-transfer explicitly.",
        "lab_prompt": "Implement `transfer` with `std::scoped_lock`. Two threads perform the same number of opposite-direction $1 transfers. Print successful-transfer count, both balances, and total. Output must not depend on scheduler order.",
        "lab_starter": r'''#include <atomic>
#include <iostream>
#include <mutex>
#include <thread>
using namespace std;
struct Account { mutex m; long long balance; };
bool transfer(Account& from, Account& to, long long amount) {
  // TODO: reject nonpositive, handle self-transfer, then lock both mutexes together.
  (void)from; (void)to; (void)amount;
  return false;
}
int main() {
  int n; cin >> n;
  Account a{{}, 1000}, b{{}, 1000};
  atomic<int> ok{0};
  thread t1([&]{ for(int i=0;i<n;++i) if(transfer(a,b,1)) ++ok; });
  thread t2([&]{ for(int i=0;i<n;++i) if(transfer(b,a,1)) ++ok; });
  t1.join(); t2.join();
  scoped_lock lock(a.m,b.m);
  cout << ok.load() << " " << a.balance << " " << b.balance << " " << (a.balance+b.balance) << "\n";
}
''',
        "lab_stdin": "100\n",
        "visible": [("Balanced opposite transfers", "100\n", "200 1000 1000 2000\n"), ("Single pair", "1\n", "2 1000 1000 2000\n")]
    },
    {
        "id": "concurrency-jthread-cancellation",
        "title": "Concurrency: jthread cooperative cancellation",
        "file": "cancellable_worker.hpp",
        "skills": ["cpp.concurrency.jthread", "cpp.concurrency.threads"],
        "minutes": 35,
        "tests": ["test_worker_starts_and_observes_stop", "test_destructor_requests_stop_and_joins", "test_stopped_future_survives_owner_scope"],
        "hints": [
            "Own the worker as std::jthread; do not detach it.",
            "Use the stop_token in the blocking wait so cancellation can wake a worker that has no work.",
            "Keep shared state alive until after the jthread destructor has requested stop and joined."
        ],
        "solution": r'''#pragma once
#include <condition_variable>
#include <future>
#include <memory>
#include <mutex>
#include <thread>

class CancellableWorker {
  struct State {
    std::mutex mutex;
    std::condition_variable_any cv;
    std::promise<void> startedPromise;
    std::promise<void> stoppedPromise;
    std::shared_future<void> started{startedPromise.get_future().share()};
    std::shared_future<void> stopped{stoppedPromise.get_future().share()};
  };
 public:
  CancellableWorker() : state_(std::make_shared<State>()), worker_([state = state_](std::stop_token token) {
    state->startedPromise.set_value();
    std::unique_lock<std::mutex> lock(state->mutex);
    state->cv.wait(lock, token, [] { return false; });
    state->stoppedPromise.set_value();
  }) {}

  void waitUntilStarted() const { state_->started.wait(); }
  void requestStop() { worker_.request_stop(); }
  std::shared_future<void> stoppedFuture() const { return state_->stopped; }
  bool joinable() const { return worker_.joinable(); }

 private:
  std::shared_ptr<State> state_;
  std::jthread worker_;
};
''',
        "starter": r'''#pragma once
#include <future>
#include <thread>

class CancellableWorker {
 public:
  CancellableWorker() : stopped_(promise_.get_future().share()) {
    // TODO: own a std::jthread whose callable receives a std::stop_token.
  }
  void waitUntilStarted() const {}
  void requestStop() { /* TODO */ }
  std::shared_future<void> stoppedFuture() const { return stopped_; }
  bool joinable() const { return false; }
 private:
  std::promise<void> promise_;
  std::shared_future<void> stopped_;
};
''',
        "test_source": r'''#include "cancellable_worker.hpp"
#include "check.hpp"
#include <chrono>
using namespace std::chrono_literals;

static void test_worker_starts_and_observes_stop() {
  CancellableWorker worker;
  worker.waitUntilStarted();
  CHECK(worker.joinable());
  auto stopped = worker.stoppedFuture();
  worker.requestStop();
  CHECK(stopped.wait_for(2s) == std::future_status::ready);
}

static void test_destructor_requests_stop_and_joins() {
  std::shared_future<void> stopped;
  {
    CancellableWorker worker;
    worker.waitUntilStarted();
    stopped = worker.stoppedFuture();
  }
  CHECK(stopped.wait_for(0s) == std::future_status::ready);
}

static void test_stopped_future_survives_owner_scope() {
  std::shared_future<void> stopped;
  {
    CancellableWorker worker;
    worker.waitUntilStarted();
    stopped = worker.stoppedFuture();
    CHECK(stopped.valid());
  }
  CHECK(stopped.valid());
  CHECK(stopped.wait_for(0s) == std::future_status::ready);
}

int main() {
  test_worker_starts_and_observes_stop();
  test_destructor_requests_stop_and_joins();
  test_stopped_future_survives_owner_scope();
  return REPORT();
}
''',
        "readme": "Build a long-lived worker owned by `std::jthread`. Cancellation is cooperative: request stop, let the worker observe its `stop_token`, and rely on RAII joining rather than detaching.",
        "lab_prompt": "Complete an owned `std::jthread` worker. The worker must announce start, block until its stop token is requested, then announce stop. No detached thread and no polling sleeps.",
        "lab_starter": r'''#include <condition_variable>
#include <iostream>
#include <mutex>
#include <thread>
using namespace std;
class Worker {
 public:
  Worker() {
    // TODO: start jthread_ with a stop_token-aware wait and update started_/stopped_.
  }
  void waitStarted() {}
  void requestStop() {}
  void waitStopped() {}
  bool started() const { return started_; }
  bool stopped() const { return stopped_; }
 private:
  bool started_{false}, stopped_{false};
};
int main() {
  Worker w;
  w.waitStarted();
  cout << (w.started() ? "started" : "not-started") << "\n";
  w.requestStop();
  w.waitStopped();
  cout << (w.stopped() ? "stopped" : "not-stopped") << "\n";
}
''',
        "lab_stdin": "",
        "visible": [("Cooperative stop", "", "started\nstopped\n")]
    },
    {
        "id": "concurrency-promise-future-errors",
        "title": "Concurrency: promise/future result and error channel",
        "file": "checked_square_task.hpp",
        "skills": ["cpp.concurrency.promise_future", "cpp.concurrency.async", "cpp.concurrency.task_selection"],
        "minutes": 35,
        "tests": ["test_success_value", "test_worker_exception_propagates", "test_multiple_independent_jobs", "test_future_is_consumed_once"],
        "hints": [
            "Create the future before moving the promise into the worker.",
            "Catch inside the worker and call set_exception(std::current_exception()).",
            "future::get() consumes a std::future; valid() becomes false after the result is retrieved."
        ],
        "solution": r'''#pragma once
#include <future>
#include <stdexcept>
#include <thread>

struct CheckedSquareTask {
  std::jthread worker;
  std::future<int> result;
};

inline CheckedSquareTask start_checked_square(int value) {
  std::promise<int> promise;
  auto future = promise.get_future();
  std::jthread worker([value, promise = std::move(promise)]() mutable {
    try {
      if (value < 0) throw std::invalid_argument("value must be nonnegative");
      promise.set_value(value * value);
    } catch (...) {
      promise.set_exception(std::current_exception());
    }
  });
  return {std::move(worker), std::move(future)};
}
''',
        "starter": r'''#pragma once
#include <future>
#include <thread>

struct CheckedSquareTask {
  std::jthread worker;
  std::future<int> result;
};

inline CheckedSquareTask start_checked_square(int value) {
  std::promise<int> promise;
  auto future = promise.get_future();
  promise.set_value(0); // TODO: move promise into a worker and propagate values/errors from there.
  (void)value;
  return {std::jthread{}, std::move(future)};
}
''',
        "test_source": r'''#include "checked_square_task.hpp"
#include "check.hpp"
#include <stdexcept>

static void test_success_value() {
  auto task = start_checked_square(7);
  CHECK(task.result.get() == 49);
}

static void test_worker_exception_propagates() {
  auto task = start_checked_square(-2);
  bool caught = false;
  try { (void)task.result.get(); }
  catch (const std::invalid_argument&) { caught = true; }
  CHECK(caught);
}

static void test_multiple_independent_jobs() {
  auto a = start_checked_square(3);
  auto b = start_checked_square(5);
  CHECK(a.result.get() == 9);
  CHECK(b.result.get() == 25);
}

static void test_future_is_consumed_once() {
  auto task = start_checked_square(4);
  CHECK(task.result.valid());
  CHECK(task.result.get() == 16);
  CHECK(!task.result.valid());
}

int main() {
  test_success_value();
  test_worker_exception_propagates();
  test_multiple_independent_jobs();
  test_future_is_consumed_once();
  return REPORT();
}
''',
        "readme": "Use `std::promise`/`std::future` as one channel that carries either a result or a worker exception. The future is single-consumption; do not add a separate shared error flag.",
        "lab_prompt": "Start a `std::jthread` that squares a nonnegative integer. Send the value through a promise; for a negative input send `std::invalid_argument` with `set_exception`. Print the square or `error` when `future::get()` rethrows.",
        "lab_starter": r'''#include <future>
#include <iostream>
#include <stdexcept>
#include <thread>
using namespace std;
future<int> startTask(int value) {
  promise<int> p;
  auto f = p.get_future();
  // TODO: move p into a jthread-owned task and set value or exception.
  p.set_value(0);
  (void)value;
  return f;
}
int main() {
  int value; cin >> value;
  auto f = startTask(value);
  try { cout << f.get() << "\n"; }
  catch (const invalid_argument&) { cout << "error\n"; }
}
''',
        "lab_stdin": "7\n",
        "visible": [("Success", "7\n", "49\n"), ("Exception", "-1\n", "error\n")]
    },
    {
        "id": "concurrency-shared-mutex-registry",
        "title": "Concurrency: shared_mutex read-heavy registry",
        "file": "thread_safe_registry.hpp",
        "skills": ["cpp.concurrency.lock_granularity", "cpp.concurrency.mutexes", "cpp.concurrency.shared_state_design"],
        "minutes": 40,
        "tests": ["test_basic_set_get", "test_returns_owned_copy", "test_concurrent_readers_and_writer"],
        "hints": [
            "Use std::unique_lock for mutation and std::shared_lock for read-only operations.",
            "Return an optional value copy rather than a reference that escapes after the lock is released.",
            "The map and its structural invariants are still shared state; shared_mutex only changes reader concurrency."
        ],
        "solution": r'''#pragma once
#include <mutex>
#include <optional>
#include <shared_mutex>
#include <string>
#include <unordered_map>

class ThreadSafeRegistry {
 public:
  void set(std::string key, int value) {
    std::unique_lock<std::shared_mutex> lock(mutex_);
    values_[std::move(key)] = value;
  }
  std::optional<int> get(const std::string& key) const {
    std::shared_lock<std::shared_mutex> lock(mutex_);
    auto it = values_.find(key);
    if (it == values_.end()) return std::nullopt;
    return it->second;
  }
  std::size_t size() const {
    std::shared_lock<std::shared_mutex> lock(mutex_);
    return values_.size();
  }
 private:
  mutable std::shared_mutex mutex_;
  std::unordered_map<std::string,int> values_;
};
''',
        "starter": r'''#pragma once
#include <optional>
#include <shared_mutex>
#include <string>
#include <unordered_map>

class ThreadSafeRegistry {
 public:
  void set(std::string key, int value) {
    // TODO: take an exclusive lock.
    values_[std::move(key)] = value;
  }
  std::optional<int> get(const std::string& key) const {
    // TODO: take a shared lock and return a value copy.
    auto it = values_.find(key);
    return it == values_.end() ? std::nullopt : std::optional<int>(it->second);
  }
  std::size_t size() const { return values_.size(); }
 private:
  mutable std::shared_mutex mutex_;
  std::unordered_map<std::string,int> values_;
};
''',
        "test_source": r'''#include "thread_safe_registry.hpp"
#include "check.hpp"
#include <atomic>
#include <barrier>
#include <thread>
#include <vector>

static void test_basic_set_get() {
  ThreadSafeRegistry registry;
  CHECK(!registry.get("x").has_value());
  registry.set("x", 3);
  CHECK(registry.get("x") == 3);
  CHECK(registry.size() == 1);
}

static void test_returns_owned_copy() {
  ThreadSafeRegistry registry;
  registry.set("x", 10);
  auto old = registry.get("x");
  registry.set("x", 20);
  CHECK(old == 10);
  CHECK(registry.get("x") == 20);
}

static void test_concurrent_readers_and_writer() {
  ThreadSafeRegistry registry;
  registry.set("value", 0);
  std::barrier start(4);
  std::atomic<bool> valid{true};
  std::vector<std::thread> readers;
  for (int r = 0; r < 3; ++r) {
    readers.emplace_back([&] {
      start.arrive_and_wait();
      for (int i = 0; i < 1000; ++i) {
        auto value = registry.get("value");
        if (!value.has_value() || *value < 0 || *value > 999) valid.store(false);
      }
    });
  }
  start.arrive_and_wait();
  for (int i = 0; i < 1000; ++i) registry.set("value", i);
  for (auto& reader : readers) reader.join();
  CHECK(valid.load());
  CHECK(registry.get("value") == 999);
}

int main() {
  test_basic_set_get();
  test_returns_owned_copy();
  test_concurrent_readers_and_writer();
  return REPORT();
}
''',
        "readme": "Build a read-heavy registry using `std::shared_mutex`: shared locks for lookups, an exclusive lock for writes, and owned return values so references never escape an expired lock.",
        "lab_prompt": "Implement a registry with `std::shared_mutex`. SET uses an exclusive lock, GET uses a shared lock and returns a value copy. Process deterministic commands and print lookup results; package tests separately exercise real concurrent readers/writers.",
        "lab_starter": r'''#include <iostream>
#include <mutex>
#include <optional>
#include <shared_mutex>
#include <string>
#include <unordered_map>
using namespace std;
class Registry {
 public:
  void set(string key, int value) { /* TODO: unique_lock */ values_[move(key)] = value; }
  optional<int> get(const string& key) const { // TODO: shared_lock
    auto it = values_.find(key); return it == values_.end() ? nullopt : optional<int>(it->second);
  }
 private:
  mutable shared_mutex m_;
  unordered_map<string,int> values_;
};
int main(){
  int n; cin>>n; Registry r;
  for(int i=0;i<n;++i){ string op,key; cin>>op>>key; if(op=="SET"){int v;cin>>v;r.set(key,v);} else {auto v=r.get(key); cout<<(v?to_string(*v):"missing")<<"\n";} }
}
''',
        "lab_stdin": "4\nSET alpha 1\nGET alpha\nGET beta\nSET alpha 2\n",
        "visible": [("Lookup copy", "5\nSET alpha 1\nGET alpha\nSET alpha 2\nGET alpha\nGET beta\n", "1\n2\nmissing\n")]
    },
    {
        "id": "concurrency-release-acquire-handoff",
        "title": "Concurrency: release/acquire publication handoff",
        "file": "publication_handoff.hpp",
        "skills": ["cpp.concurrency.memory_ordering", "cpp.concurrency.atomics", "cpp.concurrency.data_races"],
        "minutes": 40,
        "tests": ["test_consumer_sees_published_payload", "test_negative_payload", "test_independent_handoffs"],
        "hints": [
            "Write the ordinary payload before publishing the ready flag.",
            "Use memory_order_release on the publishing store and memory_order_acquire on the load that observes it.",
            "Relaxed ordering makes the flag atomic but does not publish unrelated payload writes."
        ],
        "solution": r'''#pragma once
#include <atomic>
#include <thread>

class PublicationHandoff {
 public:
  void publish(int value) {
    payload_ = value;
    ready_.store(true, std::memory_order_release);
  }
  int waitAndRead() const {
    while (!ready_.load(std::memory_order_acquire)) std::this_thread::yield();
    return payload_;
  }
 private:
  int payload_{0};
  std::atomic<bool> ready_{false};
};
''',
        "starter": r'''#pragma once
#include <atomic>
#include <thread>

class PublicationHandoff {
 public:
  void publish(int value) {
    payload_ = value;
    ready_.store(true, std::memory_order_release);
  }
  int waitAndRead() const {
    while (!ready_.load(std::memory_order_acquire)) std::this_thread::yield();
    // TODO: after the acquire observes the release, return the published payload.
    return 0;
  }
 private:
  int payload_{0};
  std::atomic<bool> ready_{false};
};
''',
        "test_source": r'''#include "publication_handoff.hpp"
#include "check.hpp"
#include <future>
#include <thread>

static int round_trip(int value) {
  PublicationHandoff handoff;
  std::promise<void> entered;
  auto started = entered.get_future();
  int observed = 0;
  std::thread consumer([&] { entered.set_value(); observed = handoff.waitAndRead(); });
  started.wait();
  handoff.publish(value);
  consumer.join();
  return observed;
}

static void test_consumer_sees_published_payload() { CHECK(round_trip(42) == 42); }
static void test_negative_payload() { CHECK(round_trip(-17) == -17); }
static void test_independent_handoffs() {
  for (int i = 0; i < 20; ++i) CHECK(round_trip(i * 3) == i * 3);
}

int main() {
  test_consumer_sees_published_payload();
  test_negative_payload();
  test_independent_handoffs();
  return REPORT();
}
''',
        "readme": "Publish ordinary payload data with an atomic ready flag. The producer performs a release store after construction; the consumer's acquire load establishes the happens-before edge before reading the payload. A relaxed ready flag would not publish unrelated data.",
        "lab_prompt": "Complete a one-shot publication handoff. Producer writes an ordinary payload then performs a release store to `ready`; consumer loops on an acquire load and then returns the payload. Print the observed value.",
        "lab_starter": r'''#include <atomic>
#include <iostream>
#include <thread>
using namespace std;
class Handoff {
 public:
  void publish(int value){ payload_=value; ready_.store(true, memory_order_release); }
  int waitRead() const { while(!ready_.load(memory_order_acquire)) this_thread::yield(); /* TODO */ return 0; }
 private: int payload_{0}; atomic<bool> ready_{false};
};
int main(){ int value;cin>>value; Handoff h; int observed=0; thread c([&]{observed=h.waitRead();}); h.publish(value); c.join(); cout<<observed<<"\n"; }
''',
        "lab_stdin": "42\n",
        "visible": [("Positive payload", "42\n", "42\n"), ("Negative payload", "-7\n", "-7\n")]
    },
]

# jthread Code Lab needs a fuller implementation skeleton than the header starter so the output tests can distinguish completion.
for spec in SPECS:
    spec["difficulty"] = "advanced"
    spec["project"] = "task-queue-lab"

CMAKE = '''cmake_minimum_required(VERSION 3.20)
project(cppfan_{project} LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CPPFAN_IMPL_DIR "${{CMAKE_CURRENT_SOURCE_DIR}}/starter" CACHE PATH "Implementation directory")
option(CPPFAN_ENABLE_SANITIZERS "Enable AddressSanitizer and UndefinedBehaviorSanitizer" ON)
add_executable(exercise_tests tests/tests.cpp)
target_include_directories(exercise_tests PRIVATE "${{CMAKE_CURRENT_SOURCE_DIR}}/../_harness" "${{CPPFAN_IMPL_DIR}}")
target_compile_options(exercise_tests PRIVATE -Wall -Wextra -Wpedantic)
if(CPPFAN_ENABLE_SANITIZERS AND CMAKE_CXX_COMPILER_ID MATCHES "Clang|GNU")
  target_compile_options(exercise_tests PRIVATE -fsanitize=address,undefined -fno-omit-frame-pointer)
  target_link_options(exercise_tests PRIVATE -fsanitize=address,undefined)
endif()
enable_testing()
add_test(NAME {project}_tests COMMAND exercise_tests)
'''


def write_package(spec: dict) -> None:
    d = EXERCISES / spec["id"]
    (d / "starter").mkdir(parents=True, exist_ok=True)
    (d / "solution").mkdir(parents=True, exist_ok=True)
    (d / "tests").mkdir(parents=True, exist_ok=True)
    (d / "starter" / spec["file"]).write_text(spec["starter"])
    (d / "solution" / spec["file"]).write_text(spec["solution"])
    (d / "tests/tests.cpp").write_text(spec["test_source"])
    slug = spec["id"].replace("-", "_")
    (d / "CMakeLists.txt").write_text(CMAKE.format(project=slug))
    metadata = {
        "id": spec["id"], "title": spec["title"], "skill_ids": spec["skills"],
        "difficulty": spec["difficulty"], "estimated_minutes": spec["minutes"],
        "editable_files": [spec["file"]],
        "build_command": f"cmake -S exercises/{spec['id']} -B exercises/{spec['id']}/work/build -DCPPFAN_IMPL_DIR=$PWD/exercises/{spec['id']}/work -DCPPFAN_ENABLE_SANITIZERS=ON -DCMAKE_BUILD_TYPE=Debug && cmake --build exercises/{spec['id']}/work/build",
        "test_command": f"ctest --test-dir exercises/{spec['id']}/work/build --output-on-failure",
        "required_tests": spec["tests"], "hints": spec["hints"], "project_lab": spec["project"]
    }
    (d / "exercise.json").write_text(json.dumps(metadata, indent=2) + "\n")
    (d / "README.md").write_text(dedent(f'''# {spec["title"]}

{spec["readme"]}

## Goal

Edit `{spec["file"]}` until every deterministic test passes. Correctness must come from synchronization and ownership, never from `sleep_for` or scheduler luck.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh {spec["id"]}
# edit exercises/{spec["id"]}/work/{spec["file"]}
scripts/exercises/test.sh {spec["id"]}
scripts/exercises/reset.sh {spec["id"]}
```

## Hints

''' + "\n".join(f"- {h}" for h in spec["hints"]) + "\n"))


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def catalog_entry(spec: dict) -> str:
    skills = ", ".join(ts_string(x) for x in spec["skills"])
    tests = ", ".join(ts_string(x) for x in spec["tests"])
    hints = ",\n      ".join(ts_string(x) for x in spec["hints"])
    return f'''  {{
    id: {ts_string(spec["id"])},
    title: {ts_string(spec["title"])},
    skillIds: [{skills}],
    difficulty: "advanced",
    estimatedMinutes: {spec["minutes"]},
    editableFiles: [{ts_string(spec["file"])}],
    requiredTests: [{tests}],
    hints: [
      {hints}
    ],
    projectLab: "task-queue-lab"
  }}'''


def template_literal(text: str) -> str:
    return text.replace("`", "\\`").replace("${", "\\${")


def config_entry(spec: dict) -> str:
    tests = ",\n      ".join(
        "{ name: %s, stdin: %s, expectedStdout: %s, matcher: \"exact\" }" % (ts_string(name), ts_string(stdin), ts_string(stdout))
        for name, stdin, stdout in spec["visible"]
    )
    skills = ", ".join(ts_string(x) for x in spec["skills"])
    return f'''  {ts_string(spec["id"])}: {{
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `{template_literal(spec["lab_prompt"])}`,
    stdin: {ts_string(spec["lab_stdin"])},
    starterCode: `{template_literal(spec["lab_starter"])}`,
    compilerFlags: ["-std=c++20", "-Wall", "-Wextra", "-Wpedantic"],
    visibleTests: [
      {tests}
    ],
    skillTags: [{skills}]
  }}'''


def insert_array_entries(path: Path, declaration: str, entries: list[str]) -> None:
    text = path.read_text()
    if SPECS[0]["id"] in text:
        raise RuntimeError(f"#706 already present in {path}")
    start = text.index(declaration)
    close = text.index("\n];", start)
    text = text[:close] + ",\n" + ",\n".join(entries) + text[close:]
    path.write_text(text)


def insert_config_entries() -> None:
    text = CONFIGS.read_text()
    if SPECS[0]["id"] in text:
        raise RuntimeError("#706 configs already present")
    start = text.index("export const EXERCISE_CODE_LAB_CONFIGS")
    close = text.rfind("\n};")
    if close <= start:
        raise RuntimeError("cannot locate exercise config close")
    text = text[:close] + ",\n" + ",\n".join(config_entry(s) for s in SPECS) + text[close:]
    CONFIGS.write_text(text)


def write_unit_test() -> None:
    ids = ",\n  ".join(ts_string(s["id"]) for s in SPECS)
    UNIT.write_text(f'''import {{ readFileSync }} from "node:fs";\nimport {{ join }} from "node:path";\nimport {{ describe, expect, it }} from "vitest";\nimport {{ exerciseCatalog }} from "@/features/exercises/exercise-catalog";\nimport {{ EXERCISE_CODE_LAB_CONFIGS }} from "@/features/code-lab/exercise-code-lab-configs";\nimport {{ getCodeLabConfigForItem }} from "@/features/code-lab/code-lab-catalog";\n\nconst IDS = [\n  {ids}\n] as const;\n\ndescribe("focused concurrency exercises (#706)", () => {{\n  it("registers all six packages in catalog and Code Lab with C++20", () => {{\n    for (const id of IDS) {{\n      const exercise = exerciseCatalog.find((entry) => entry.id === id);\n      expect(exercise, id).toBeTruthy();\n      expect(exercise!.projectLab).toBe("task-queue-lab");\n      expect(exercise!.skillIds.some((skill) => skill.startsWith("cpp.concurrency."))).toBe(true);\n      const config = EXERCISE_CODE_LAB_CONFIGS[id];\n      expect(config, id).toBeTruthy();\n      expect(config.compilerFlags).toContain("-std=c++20");\n      expect(config.visibleTests.length).toBeGreaterThan(0);\n      expect(config.skillTags).toEqual(exercise!.skillIds);\n      expect(getCodeLabConfigForItem(id)).toBe(config);\n    }}\n  }});\n\n  it("keeps package tests scheduler-independent", () => {{\n    for (const id of IDS) {{\n      const tests = readFileSync(join(process.cwd(), "exercises", id, "tests", "tests.cpp"), "utf8");\n      expect(tests, id).not.toMatch(/sleep_for|sleep_until|usleep\s*\(/);\n    }}\n  }});\n\n  it("brings the native concurrency exercise set to nine focused packages", () => {{\n    const concurrency = exerciseCatalog.filter((entry) => entry.skillIds.some((skill) => skill.startsWith("cpp.concurrency.")));\n    expect(concurrency.map((entry) => entry.id)).toEqual(expect.arrayContaining([\n      "concurrency-atomic-counter",\n      "concurrency-producer-consumer",\n      "concurrency-task-queue",\n      ...IDS\n    ]));\n    expect(concurrency.length).toBeGreaterThanOrEqual(9);\n  }});\n}});\n''')


def write_e2e() -> None:
    E2E.write_text(r'''import { expect, test } from "@playwright/test";

test("new concurrency exercises resolve to full-page Code Lab", async ({ page }) => {
  await page.goto("/lab/concurrency-deadlock-safe-transfer");
  const workspace = page.getByTestId("code-lab-workspace");
  await expect(workspace).toBeVisible();
  await expect(page.getByText(/deadlock-safe account transfer/i)).toBeVisible();
  await expect(page.getByText(/std::scoped_lock/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Run Tests" })).toBeVisible();

  await page.goto("/lab/concurrency-jthread-cancellation");
  await expect(page.getByTestId("code-lab-workspace")).toBeVisible();
  await expect(page.getByText(/jthread cooperative cancellation/i)).toBeVisible();
  await expect(page.getByText(/stop token|stop_token/i)).toBeVisible();
});

test("exercise catalog exposes the deadlock-safe transfer practice", async ({ page }) => {
  await page.goto("/exercises");
  await expect(page.getByText(/deadlock-safe account transfer/i)).toBeVisible();
});
''')


def patch_docs() -> None:
    block = "\n\n## Focused concurrency practice (#706)\n\n" + "\n".join(
        f"- `{s['id']}` — {', '.join(x.removeprefix('cpp.concurrency.') for x in s['skills'])}; project lab `{s['project']}`."
        for s in SPECS
    ) + "\n"
    for path in [DOC_WRITE, DOC_COVERAGE]:
        text = path.read_text()
        if "## Focused concurrency practice (#706)" not in text:
            path.write_text(text + block)


def cleanup() -> None:
    for p in [ROOT / ".github/workflows/codex-706-bootstrap.yml", ROOT / "scripts/tmp/issue-706-bootstrap.py"]:
        if p.exists(): p.unlink()
    d = ROOT / "scripts/tmp"
    if d.exists() and not any(d.iterdir()): d.rmdir()

for spec in SPECS: write_package(spec)
insert_array_entries(CATALOG, "export const exerciseCatalog: Exercise[] = [", [catalog_entry(s) for s in SPECS])
insert_config_entries()
write_unit_test()
write_e2e()
patch_docs()
cleanup()
print("Applied #706 with", len(SPECS), "concurrency exercise packages")
