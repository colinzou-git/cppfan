// Tests for sort-custom-log-records. Build with -I _harness and the impl dir.
#include <string>
#include <vector>

#include "check.hpp"
#include "sort_records.hpp"

using V = std::vector<Record>;

static void test_by_score_desc() {
  V in{{"amy", 50}, {"bob", 90}, {"cid", 70}};
  V expected{{"bob", 90}, {"cid", 70}, {"amy", 50}};
  CHECK(sort_records(in) == expected);
}

static void test_tie_by_name_asc() {
  V in{{"zoe", 80}, {"ann", 80}, {"mia", 80}};
  V expected{{"ann", 80}, {"mia", 80}, {"zoe", 80}};
  CHECK(sort_records(in) == expected);
}

static void test_mixed() {
  V in{{"bo", 70}, {"al", 90}, {"cy", 70}, {"di", 90}};
  V expected{{"al", 90}, {"di", 90}, {"bo", 70}, {"cy", 70}};
  CHECK(sort_records(in) == expected);
}

static void test_stable_on_equal_keys() {
  // Two records equal on both keys keep input order.
  V in{{"x", 50}, {"x", 50}, {"a", 90}};
  V got = sort_records(in);
  V expected{{"a", 90}, {"x", 50}, {"x", 50}};
  CHECK(got == expected);
}

static void test_empty_and_single() {
  CHECK(sort_records({}).empty());
  V one{{"solo", 42}};
  CHECK(sort_records(one) == one);
}

int main() {
  test_by_score_desc();
  test_tie_by_name_asc();
  test_mixed();
  test_stable_on_equal_keys();
  test_empty_and_single();
  return REPORT();
}
