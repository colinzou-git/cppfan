// Tests for dp-unique-paths. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "unique_paths.hpp"

static void test_trivial() {
  CHECK(unique_paths(1, 1) == 1);
}

static void test_single_row() {
  CHECK(unique_paths(1, 7) == 1);
  CHECK(unique_paths(5, 1) == 1);
}

static void test_small_grid() {
  CHECK(unique_paths(3, 7) == 28);
  CHECK(unique_paths(3, 2) == 3);
}

static void test_square() {
  CHECK(unique_paths(3, 3) == 6);
  CHECK(unique_paths(4, 4) == 20);
}

static void test_symmetry() {
  CHECK(unique_paths(7, 3) == unique_paths(3, 7));
  CHECK(unique_paths(10, 10) == 48620);
}

int main() {
  test_trivial();
  test_single_row();
  test_small_grid();
  test_square();
  test_symmetry();
  return REPORT();
}
