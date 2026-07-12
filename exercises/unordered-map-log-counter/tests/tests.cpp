// Tests for unordered-map-log-counter. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "log_counter.hpp"

static void test_records_and_counts() {
  LogCounter c;
  c.record("login");
  c.record("login");
  c.record("logout");
  CHECK(c.count("login") == 2);
  CHECK(c.count("logout") == 1);
}

static void test_count_absent_is_zero() {
  LogCounter c;
  c.record("login");
  CHECK(c.count("signup") == 0);
}

static void test_distinct() {
  LogCounter c;
  c.record("a");
  c.record("a");
  c.record("b");
  CHECK(c.distinct() == 2);
}

static void test_most_frequent() {
  LogCounter c;
  c.record("view");
  c.record("view");
  c.record("view");
  c.record("click");
  CHECK(c.most_frequent() == "view");
}

static void test_most_frequent_tie_breaks_by_name() {
  LogCounter c;
  c.record("beta");
  c.record("alpha");
  CHECK(c.most_frequent() == "alpha");
}

static void test_empty_most_frequent() {
  LogCounter c;
  CHECK(c.most_frequent() == "");
  CHECK(c.distinct() == 0);
}

int main() {
  test_records_and_counts();
  test_count_absent_is_zero();
  test_distinct();
  test_most_frequent();
  test_most_frequent_tie_breaks_by_name();
  test_empty_most_frequent();
  return REPORT();
}
