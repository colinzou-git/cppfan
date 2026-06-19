// Tests for math-combination-generator. Build with -I _harness and the implementation dir.
#include <vector>

#include "check.hpp"
#include "combination_generator.hpp"

static void test_count_small_combinations() {
  CHECK(count_combinations(5, 2) == 10);
  CHECK(count_combinations(6, 0) == 1);
  CHECK(count_combinations(6, 6) == 1);
  CHECK(count_combinations(8, 3) == 56);
}

static void test_rejects_impossible_counts() {
  CHECK(count_combinations(4, 5) == 0);
  CHECK(count_combinations(4, -1) == 0);
  CHECK(count_combinations(-1, 0) == 0);
}

static void test_generates_lexicographic_combinations() {
  const std::vector<std::vector<int>> expected{
      {1, 2},
      {1, 3},
      {1, 4},
      {2, 3},
      {2, 4},
      {3, 4},
  };
  CHECK(generate_combinations(4, 2) == expected);
}

static void test_handles_empty_selection() {
  const std::vector<std::vector<int>> expected{{}};
  CHECK(generate_combinations(4, 0) == expected);
  CHECK(generate_combinations(2, 3).empty());
}

static void test_subset_from_mask_decodes_flags() {
  const std::vector<int> values{10, 20, 30, 40};
  const std::vector<int> expected{20, 40};
  CHECK(subset_from_mask(values, 0b1010) == expected);
  CHECK(subset_from_mask(values, 0).empty());
}

static void test_generated_count_matches_pascal_count() {
  const auto combos = generate_combinations(5, 3);
  CHECK(static_cast<long long>(combos.size()) == count_combinations(5, 3));
  for (const auto& combo : combos) {
    CHECK(combo.size() == 3);
    CHECK(combo[0] < combo[1]);
    CHECK(combo[1] < combo[2]);
  }
}

int main() {
  test_count_small_combinations();
  test_rejects_impossible_counts();
  test_generates_lexicographic_combinations();
  test_handles_empty_selection();
  test_subset_from_mask_decodes_flags();
  test_generated_count_matches_pascal_count();
  return REPORT();
}
