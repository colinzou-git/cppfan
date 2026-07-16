// Tests for matrix-transpose. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "transpose.hpp"

#include <vector>

using Matrix = std::vector<std::vector<int>>;

static void test_square() {
  CHECK(transpose(Matrix{{1, 2}, {3, 4}}) == (Matrix{{1, 3}, {2, 4}}));
}

static void test_rectangular() {
  CHECK(transpose(Matrix{{1, 2, 3}, {4, 5, 6}}) == (Matrix{{1, 4}, {2, 5}, {3, 6}}));
}

static void test_single_row() {
  CHECK(transpose(Matrix{{1, 2, 3}}) == (Matrix{{1}, {2}, {3}}));
}

static void test_single_column() {
  CHECK(transpose(Matrix{{1}, {2}, {3}}) == (Matrix{{1, 2, 3}}));
}

static void test_empty() {
  CHECK(transpose(Matrix{}) == Matrix{});
}

int main() {
  test_square();
  test_rectangular();
  test_single_row();
  test_single_column();
  test_empty();
  return REPORT();
}
