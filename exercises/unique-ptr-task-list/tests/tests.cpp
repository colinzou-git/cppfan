// Tests for unique-ptr-task-list. Build with -I _harness and the impl dir.
#include <memory>

#include "check.hpp"
#include "task_list.hpp"

static void test_add_and_size() {
  TaskList list;
  list.add(1, "write");
  list.add(2, "review");
  CHECK(list.size() == 2);
}

static void test_find() {
  TaskList list;
  list.add(1, "write");
  list.add(2, "review");
  const Task* t = list.find(2);
  CHECK(t != nullptr);
  if (t != nullptr) {
    CHECK(t->title == "review");
  }
  CHECK(list.find(9) == nullptr);
}

static void test_remove() {
  TaskList list;
  list.add(1, "a");
  list.add(2, "b");
  CHECK(list.remove(1));
  CHECK(list.size() == 1);
  CHECK(list.find(1) == nullptr);
  CHECK(!list.remove(1));  // already gone
}

static void test_take_transfers_ownership() {
  TaskList list;
  list.add(1, "a");
  list.add(2, "b");
  std::unique_ptr<Task> owned = list.take(1);
  CHECK(owned != nullptr);
  if (owned != nullptr) {
    CHECK(owned->id == 1 && owned->title == "a");
  }
  CHECK(list.size() == 1);
  CHECK(list.find(1) == nullptr);
}

static void test_take_missing() {
  TaskList list;
  list.add(1, "a");
  CHECK(list.take(5) == nullptr);
  CHECK(list.size() == 1);
}

int main() {
  test_add_and_size();
  test_find();
  test_remove();
  test_take_transfers_ownership();
  test_take_missing();
  return REPORT();
}
