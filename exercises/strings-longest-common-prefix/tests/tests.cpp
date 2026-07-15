// Tests for strings-longest-common-prefix. Build with -I _harness and impl.
#include "check.hpp"
#include "common_prefix.hpp"

#include <string>
#include <vector>

static void test_empty_input() {
  CHECK(longest_common_prefix(std::vector<std::string>{}) == "");
}

static void test_single() {
  CHECK(longest_common_prefix(std::vector<std::string>{"solo"}) == "solo");
}

static void test_common() {
  CHECK(longest_common_prefix(std::vector<std::string>{"flower", "flow", "flight"}) == "fl");
  CHECK(longest_common_prefix(std::vector<std::string>{"interspecies", "interstellar", "interstate"}) == "inters");
}

static void test_no_common() {
  CHECK(longest_common_prefix(std::vector<std::string>{"dog", "cat", "bird"}) == "");
  CHECK(longest_common_prefix(std::vector<std::string>{"ab", "cd"}) == "");
}

static void test_prefix_is_whole_word() {
  // shortest word is itself the common prefix
  CHECK(longest_common_prefix(std::vector<std::string>{"go", "goto", "gopher"}) == "go");
  // one empty word forces an empty prefix
  CHECK(longest_common_prefix(std::vector<std::string>{"abc", ""}) == "");
}

int main() {
  test_empty_input();
  test_single();
  test_common();
  test_no_common();
  test_prefix_is_whole_word();
  return REPORT();
}
