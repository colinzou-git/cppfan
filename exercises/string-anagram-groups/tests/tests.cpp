// Tests for string-anagram-groups. Build with -I _harness and the impl dir.
#include <string>
#include <vector>

#include "check.hpp"
#include "anagram_groups.hpp"

using Groups = std::vector<std::vector<std::string>>;

static void test_basic_grouping() {
  Groups g = group_anagrams({"eat", "tea", "tan", "ate", "nat", "bat"});
  Groups expected{{"ate", "eat", "tea"}, {"bat"}, {"nat", "tan"}};
  CHECK(g == expected);
}

static void test_single_word() {
  CHECK((group_anagrams({"abc"}) == Groups{{"abc"}}));
}

static void test_all_distinct() {
  Groups g = group_anagrams({"dog", "cat", "bird"});
  Groups expected{{"bird"}, {"cat"}, {"dog"}};
  CHECK(g == expected);
}

static void test_empty_input() {
  CHECK(group_anagrams({}).empty());
}

static void test_keeps_duplicates() {
  Groups g = group_anagrams({"ab", "ba", "ab"});
  Groups expected{{"ab", "ab", "ba"}};
  CHECK(g == expected);
}

static void test_case_sensitive() {
  // 'A' (65) sorts before 'a' (97); "Ab" and "ba" are not anagrams here.
  Groups g = group_anagrams({"ba", "Ab"});
  Groups expected{{"Ab"}, {"ba"}};
  CHECK(g == expected);
}

int main() {
  test_basic_grouping();
  test_single_word();
  test_all_distinct();
  test_empty_input();
  test_keeps_duplicates();
  test_case_sensitive();
  return REPORT();
}
