// Tests for strings-roman-to-integer. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "roman_to_integer.hpp"

#include <string>

static void test_simple() {
  CHECK(roman_to_integer("III") == 3);
  CHECK(roman_to_integer("VIII") == 8);
}

static void test_subtractive() {
  CHECK(roman_to_integer("IV") == 4);
  CHECK(roman_to_integer("IX") == 9);
  CHECK(roman_to_integer("XL") == 40);
  CHECK(roman_to_integer("CM") == 900);
}

static void test_mixed() {
  CHECK(roman_to_integer("LVIII") == 58);   // L=50, V=5, III=3
  CHECK(roman_to_integer("XIV") == 14);
}

static void test_large() {
  CHECK(roman_to_integer("MCMXCIV") == 1994);  // M CM XC IV
  CHECK(roman_to_integer("MMXXIV") == 2024);
}

static void test_single() {
  CHECK(roman_to_integer("I") == 1);
  CHECK(roman_to_integer("M") == 1000);
}

int main() {
  test_simple();
  test_subtractive();
  test_mixed();
  test_large();
  test_single();
  return REPORT();
}
