// Tests for trie-autocomplete. Build with -I _harness and the implementation dir.
#include <string>
#include <vector>

#include "autocomplete.hpp"
#include "check.hpp"

static void test_exact_membership() {
  AutocompleteIndex index({"apple", "app", "apply", "bat"});
  CHECK(index.contains("app"));
  CHECK(index.contains("apple"));
  CHECK(!index.contains("appl"));
  CHECK(!index.contains("cat"));
}

static void test_prefix_suggestions_sorted() {
  AutocompleteIndex index({"apple", "app", "ape", "bat", "apply"});
  const std::vector<std::string> expected{"ape", "app", "apple", "apply"};
  CHECK(index.suggestions("ap", 10) == expected);
}

static void test_limit_and_missing_prefix() {
  AutocompleteIndex index({"delta", "deal", "dear", "dog"});
  const std::vector<std::string> limited{"deal", "dear"};
  CHECK(index.suggestions("de", 2) == limited);
  CHECK(index.suggestions("z", 5).empty());
  CHECK(index.suggestions("de", 0).empty());
}

static void test_insert_adds_word_without_duplicates() {
  AutocompleteIndex index({"car", "cart"});
  index.insert("card");
  index.insert("car");
  const std::vector<std::string> expected{"car", "card", "cart"};
  CHECK(index.contains("card"));
  CHECK(index.suggestions("car", 10) == expected);
}

static void test_empty_prefix_returns_dictionary_order() {
  AutocompleteIndex index({"bee", "ant", "bear"});
  const std::vector<std::string> expected{"ant", "bear", "bee"};
  CHECK(index.suggestions("", 10) == expected);
}

int main() {
  test_exact_membership();
  test_prefix_suggestions_sorted();
  test_limit_and_missing_prefix();
  test_insert_adds_word_without_duplicates();
  test_empty_prefix_returns_dictionary_order();
  return REPORT();
}
