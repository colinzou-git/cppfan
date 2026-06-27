#include "check.hpp"
#include "safe_find.hpp"
#include <vector>

void test_found_mutable_pointer_updates_original() {
  std::vector<int> v{1, 2, 3};
  int* p = find_first(v, 2);
  CHECK(p != nullptr);
  if (p != nullptr) {
    *p = 9;
    CHECK(v[1] == 9);
  }
}

void test_not_found_returns_nullptr() {
  std::vector<int> v{1, 2};
  CHECK(find_first(v, 5) == nullptr);
}

void test_first_duplicate() {
  std::vector<int> v{4, 7, 7};
  int* p = find_first(v, 7);
  CHECK(p == &v[1]);
}

void test_const_overload() {
  const std::vector<int> v{3, 8};
  const int* p = find_first(v, 8);
  CHECK(p != nullptr);
  if (p != nullptr) CHECK(*p == 8);
}

int main() {
  test_found_mutable_pointer_updates_original(); test_not_found_returns_nullptr(); test_first_duplicate(); test_const_overload(); return REPORT();
}
