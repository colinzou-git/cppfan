#include "check.hpp"
#include "promise_jobs.hpp"
#include <string>
#include <vector>

static void test_success_values() {
  CHECK(parallel_square_results({2, 3, 4}) == (std::vector<std::string>{"4", "9", "16"}));
}
static void test_exceptions_propagate() {
  CHECK(parallel_square_results({-1, -100}) == (std::vector<std::string>{"error", "error"}));
}
static void test_mixed_jobs() {
  CHECK(parallel_square_results({-2, 0, 10}) == (std::vector<std::string>{"error", "0", "100"}));
}
static void test_empty_jobs() {
  CHECK(parallel_square_results({}).empty());
}
static void test_independent_jobs() {
  const auto result = parallel_square_results({1, -1, 7, 3, -5, 6});
  CHECK(result == (std::vector<std::string>{"1", "error", "49", "9", "error", "36"}));
}
int main() {
  test_success_values();
  test_exceptions_propagate();
  test_mixed_jobs();
  test_empty_jobs();
  test_independent_jobs();
  return REPORT();
}
