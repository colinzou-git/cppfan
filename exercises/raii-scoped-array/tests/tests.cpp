// Tests for raii-scoped-array. Build with the implementation include dir on the
// path (-I starter or -I solution) plus -I _harness.
#include <utility>

#include "check.hpp"
#include "scoped_array.hpp"

static int test_basic_storage() {
  ScopedArray a(3);
  CHECK(a.size() == 3);
  CHECK(a.at(0) == 0);  // value-initialized
  a.at(0) = 7;
  a.at(2) = 9;
  CHECK(a.at(0) == 7);
  CHECK(a.at(2) == 9);
  return 0;
}

static int test_live_count_returns_to_baseline() {
  const int baseline = ScopedArray::live();
  {
    ScopedArray a(4);
    CHECK(ScopedArray::live() == baseline + 1);
    {
      ScopedArray b(2);
      CHECK(ScopedArray::live() == baseline + 2);
    }
    CHECK(ScopedArray::live() == baseline + 1);
  }
  CHECK(ScopedArray::live() == baseline);
  return 0;
}

static int test_move_transfers_ownership() {
  const int baseline = ScopedArray::live();
  ScopedArray a(5);
  a.at(1) = 42;
  ScopedArray b(std::move(a));
  // Move must not create a second owner.
  CHECK(ScopedArray::live() == baseline + 1);
  CHECK(b.size() == 5);
  CHECK(b.at(1) == 42);
  CHECK(a.size() == 0);  // moved-from is empty
  return 0;
}

static int test_move_assignment_transfers_ownership() {
  const int baseline = ScopedArray::live();
  ScopedArray a(3);
  a.at(0) = 11;
  ScopedArray b(1);
  CHECK(ScopedArray::live() == baseline + 2);
  b = std::move(a);  // move-assign: b releases its own buffer and takes a's
  CHECK(ScopedArray::live() == baseline + 1);  // exactly one live owner remains
  CHECK(b.size() == 3);
  CHECK(b.at(0) == 11);
  CHECK(a.size() == 0);  // moved-from is empty
  return 0;
}

int main() {
  test_basic_storage();
  test_live_count_returns_to_baseline();
  test_move_transfers_ownership();
  test_move_assignment_transfers_ownership();
  return REPORT();
}
