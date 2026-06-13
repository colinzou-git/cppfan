// Tests for dsa-two-sum-sorted. Build with -I _harness and the implementation dir.
#include <utility>
#include <vector>

#include "check.hpp"
#include "two_sum.hpp"

static void test_middle_pair() {
  std::vector<int> nums{1, 2, 4, 7, 11, 15};
  auto r = two_sum_sorted(nums, 15);  // 4 + 11
  CHECK(r.first == 2 && r.second == 4);
}

static void test_smallest_i_pair() {
  std::vector<int> nums{1, 2, 4, 7, 11, 15};
  auto r = two_sum_sorted(nums, 9);  // 2 + 7
  CHECK(r.first == 1 && r.second == 3);
}

static void test_first_two() {
  std::vector<int> nums{1, 2, 4, 7, 11, 15};
  auto r = two_sum_sorted(nums, 3);  // 1 + 2
  CHECK(r.first == 0 && r.second == 1);
}

static void test_no_solution() {
  std::vector<int> nums{1, 2, 4, 7, 11, 15};
  auto r = two_sum_sorted(nums, 100);
  CHECK(r.first == -1 && r.second == -1);
}

static void test_too_small_input() {
  std::vector<int> one{5};
  CHECK((two_sum_sorted(one, 5).first == -1));
  std::vector<int> none{};
  CHECK((two_sum_sorted(none, 0).first == -1));
}

static void test_handles_negatives() {
  std::vector<int> nums{-8, -3, 0, 4, 9};
  auto r = two_sum_sorted(nums, 1);  // -8 + 9 = 1 (smallest i wins over -3 + 4)
  CHECK(r.first == 0 && r.second == 4);
}

int main() {
  test_middle_pair();
  test_smallest_i_pair();
  test_first_two();
  test_no_solution();
  test_too_small_input();
  test_handles_negatives();
  return REPORT();
}
