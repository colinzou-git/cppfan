// Tests for matrix-rotate-image. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "rotate_image.hpp"

#include <vector>

using Matrix = std::vector<std::vector<int>>;

static void test_2x2() {
  CHECK(rotate_image(Matrix{{1, 2}, {3, 4}}) == (Matrix{{3, 1}, {4, 2}}));
}

static void test_3x3() {
  CHECK(rotate_image(Matrix{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}) ==
        (Matrix{{7, 4, 1}, {8, 5, 2}, {9, 6, 3}}));
}

static void test_1x1() {
  CHECK(rotate_image(Matrix{{42}}) == (Matrix{{42}}));
}

static void test_empty() {
  CHECK(rotate_image(Matrix{}) == Matrix{});
}

static void test_values() {
  // Corners rotate clockwise: top-left -> top-right, etc.
  auto out = rotate_image(Matrix{{1, 0, 0}, {0, 0, 0}, {0, 0, 0}});
  CHECK(out == (Matrix{{0, 0, 1}, {0, 0, 0}, {0, 0, 0}}));
}

int main() {
  test_2x2();
  test_3x3();
  test_1x1();
  test_empty();
  test_values();
  return REPORT();
}
