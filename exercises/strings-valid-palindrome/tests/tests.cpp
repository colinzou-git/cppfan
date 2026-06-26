// Tests for strings-valid-palindrome. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "palindrome.hpp"

static void test_simple_palindrome() {
  CHECK(is_palindrome("racecar"));
  CHECK(is_palindrome("abba"));
}

static void test_not_a_palindrome() {
  CHECK(!is_palindrome("hello"));
  CHECK(!is_palindrome("abca"));
}

static void test_ignores_case() {
  CHECK(is_palindrome("RaceCar"));
  CHECK(is_palindrome("Aba"));
}

static void test_ignores_punctuation_and_spaces() {
  CHECK(is_palindrome("A man, a plan, a canal: Panama"));
  CHECK(is_palindrome("No 'x' in Nixon"));
  CHECK(!is_palindrome("race a car"));
}

static void test_empty_and_single() {
  CHECK(is_palindrome(""));
  CHECK(is_palindrome("x"));
  CHECK(is_palindrome(",.!"));  // no alphanumerics
}

static void test_digits() {
  CHECK(is_palindrome("12321"));
  CHECK(!is_palindrome("12345"));
}

int main() {
  test_simple_palindrome();
  test_not_a_palindrome();
  test_ignores_case();
  test_ignores_punctuation_and_spaces();
  test_empty_and_single();
  test_digits();
  return REPORT();
}
