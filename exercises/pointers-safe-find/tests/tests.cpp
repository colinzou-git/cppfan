// Tests for pointers-safe-find. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "safe_find.hpp"

static void test_finds_first_match() {
  std::vector<int> v{4, 8, 15, 16, 23};
  const int* p = find_first(v, 15);
  CHECK(p != nullptr);
  CHECK(p == &v[2]);
  CHECK(p != nullptr && *p == 15);
}

static void test_returns_nullptr_when_missing() {
  std::vector<int> v{1, 2, 3};
  CHECK(find_first(v, 99) == nullptr);
}

static void test_empty_vector() {
  std::vector<int> v{};
  CHECK(find_first(v, 0) == nullptr);
}

static void test_finds_first_of_duplicates() {
  std::vector<int> v{5, 7, 5, 7};
  const int* p = find_first(v, 7);
  CHECK(p == &v[1]);
}

static void test_mutable_pointer_edits_in_place() {
  std::vector<int> v{1, 2, 3};
  int* p = find_first_mutable(v, 2);
  CHECK(p != nullptr);
  if (p != nullptr) {
    *p = 42;
  }
  CHECK(v[1] == 42);
}

static void test_contains() {
  std::vector<int> v{10, 20, 30};
  CHECK(contains(v, 20));
  CHECK(!contains(v, 25));
}

int main() {
  test_finds_first_match();
  test_returns_nullptr_when_missing();
  test_empty_vector();
  test_finds_first_of_duplicates();
  test_mutable_pointer_edits_in_place();
  test_contains();
  return REPORT();
}
