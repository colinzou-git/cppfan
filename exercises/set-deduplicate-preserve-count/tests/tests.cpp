// Tests for set-deduplicate-preserve-count. Build with -I _harness and impl dir.
#include <vector>

#include "check.hpp"
#include "dedupe.hpp"

static void test_basic_dedupe() {
  DedupeResult r = dedupe({3, 1, 2, 3, 1});
  CHECK(r.distinct == 3);
  CHECK(r.duplicates_removed == 2);
  CHECK((r.sorted_unique == std::vector<int>{1, 2, 3}));
}

static void test_already_unique() {
  DedupeResult r = dedupe({5, 4, 6});
  CHECK(r.distinct == 3);
  CHECK(r.duplicates_removed == 0);
  CHECK((r.sorted_unique == std::vector<int>{4, 5, 6}));
}

static void test_empty() {
  DedupeResult r = dedupe({});
  CHECK(r.distinct == 0);
  CHECK(r.duplicates_removed == 0);
  CHECK(r.sorted_unique.empty());
}

static void test_all_same() {
  DedupeResult r = dedupe({7, 7, 7, 7});
  CHECK(r.distinct == 1);
  CHECK(r.duplicates_removed == 3);
  CHECK((r.sorted_unique == std::vector<int>{7}));
}

static void test_handles_negatives_sorted() {
  DedupeResult r = dedupe({-1, -5, 3, -1, 3});
  CHECK(r.distinct == 3);
  CHECK((r.sorted_unique == std::vector<int>{-5, -1, 3}));
}

int main() {
  test_basic_dedupe();
  test_already_unique();
  test_empty();
  test_all_same();
  test_handles_negatives_sorted();
  return REPORT();
}
