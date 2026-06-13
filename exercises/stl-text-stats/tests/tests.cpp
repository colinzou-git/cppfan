// Tests for stl-text-stats. Build with -I _harness and the implementation dir.
#include "check.hpp"
#include "text_stats.hpp"

static void test_counts_and_lowercasing() {
  WordStats s = analyze("The cat the Dog the");
  CHECK(s.word_count == 5);
  CHECK(s.freq.at("the") == 3);
  CHECK(s.freq.at("cat") == 1);
  CHECK(s.freq.at("dog") == 1);
  CHECK(s.freq.size() == 3);
}

static void test_empty_text() {
  WordStats s = analyze("   \t\n  ");
  CHECK(s.word_count == 0);
  CHECK(s.freq.empty());
}

static void test_top_n_orders_by_count_then_word() {
  WordStats s = analyze("the the cat dog dog apple");
  // counts: the=2, dog=2, cat=1, apple=1
  auto top = top_n(s, 3);
  CHECK(top.size() == 3);
  CHECK(top[0].first == "dog" && top[0].second == 2);   // tie at 2: dog < the
  CHECK(top[1].first == "the" && top[1].second == 2);
  CHECK(top[2].first == "apple" && top[2].second == 1);  // tie at 1: apple < cat
}

static void test_top_n_clamps_to_distinct() {
  WordStats s = analyze("a b a");
  auto top = top_n(s, 10);
  CHECK(top.size() == 2);
  CHECK(top[0].first == "a" && top[0].second == 2);
}

int main() {
  test_counts_and_lowercasing();
  test_empty_text();
  test_top_n_orders_by_count_then_word();
  test_top_n_clamps_to_distinct();
  return REPORT();
}
