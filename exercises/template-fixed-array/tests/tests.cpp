// Tests for template-fixed-array. Build with -I _harness and the impl dir.
#include <cmath>

#include "check.hpp"
#include "fixed_array.hpp"

static void test_size_and_default() {
  FixedArray<int, 3> a;
  CHECK(a.size() == 3);
  CHECK(a[0] == 0 && a[1] == 0 && a[2] == 0);
  CHECK(a.sum() == 0);
}

static void test_index_assignment() {
  FixedArray<int, 3> a;
  a[0] = 1;
  a[1] = 2;
  a[2] = 3;
  CHECK(a.sum() == 6);
  CHECK(a[1] == 2);
}

static void test_fill() {
  FixedArray<int, 4> a;
  a.fill(7);
  CHECK(a[0] == 7 && a[3] == 7);
  CHECK(a.sum() == 28);
}

static void test_double_type() {
  FixedArray<double, 2> a;
  a.fill(1.5);
  CHECK(std::fabs(a.sum() - 3.0) < 1e-9);
}

static void test_const_access() {
  FixedArray<int, 2> a;
  a.fill(5);
  const FixedArray<int, 2>& r = a;
  CHECK(r[0] == 5 && r.size() == 2 && r.sum() == 10);
}

int main() {
  test_size_and_default();
  test_index_assignment();
  test_fill();
  test_double_type();
  test_const_access();
  return REPORT();
}
