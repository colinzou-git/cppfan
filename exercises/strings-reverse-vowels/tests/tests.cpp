// Tests for strings-reverse-vowels. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "reverse_vowels.hpp"

#include <string>

static void test_basic() {
  CHECK(reverse_vowels("hello") == "holle");
  CHECK(reverse_vowels("leetcode") == "leotcede");
}

static void test_mixed_case() {
  CHECK(reverse_vowels("aA") == "Aa");
  CHECK(reverse_vowels("Iceland") == "acelInd");
}

static void test_no_vowels() {
  CHECK(reverse_vowels("bcdfg") == "bcdfg");
}

static void test_all_vowels() {
  CHECK(reverse_vowels("aeiou") == "uoiea");
}

static void test_empty() {
  CHECK(reverse_vowels("") == "");
  CHECK(reverse_vowels("x") == "x");
}

int main() {
  test_basic();
  test_mixed_case();
  test_no_vowels();
  test_all_vowels();
  test_empty();
  return REPORT();
}
