// Tests for dsu-number-of-islands. Build with -I _harness and the impl dir.
#include <string>
#include <vector>

#include "check.hpp"
#include "num_islands.hpp"

static void test_empty_grid() {
  CHECK(num_islands({}) == 0);
}

static void test_all_water() {
  CHECK(num_islands({"000", "000"}) == 0);
}

static void test_single_land() {
  CHECK(num_islands({"1"}) == 1);
}

static void test_one_big_island() {
  CHECK(num_islands({"111", "111"}) == 1);
}

static void test_three_islands() {
  std::vector<std::string> grid{
      "11000",
      "11000",
      "00100",
      "00011"};
  CHECK(num_islands(grid) == 3);
}

static void test_diagonal_not_connected() {
  std::vector<std::string> grid{
      "101",
      "010",
      "101"};
  CHECK(num_islands(grid) == 5);
}

static void test_snake_island() {
  std::vector<std::string> grid{
      "1110",
      "0010",
      "0110"};
  CHECK(num_islands(grid) == 1);
}

int main() {
  test_empty_grid();
  test_all_water();
  test_single_land();
  test_one_big_island();
  test_three_islands();
  test_diagonal_not_connected();
  test_snake_island();
  return REPORT();
}
