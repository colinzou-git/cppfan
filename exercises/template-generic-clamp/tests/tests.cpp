// Tests for template-generic-clamp. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "generic_clamp.hpp"

static void test_int() {
  CHECK(clamp_value(5, 0, 10) == 5);
  CHECK(clamp_value(-3, 0, 10) == 0);
  CHECK(clamp_value(42, 0, 10) == 10);
}

static void test_double() {
  CHECK(clamp_value(2.5, 0.0, 1.0) == 1.0);
  CHECK(clamp_value(-0.5, 0.0, 1.0) == 0.0);
  CHECK(clamp_value(0.5, 0.0, 1.0) == 0.5);
}

static void test_char() {
  CHECK(clamp_value('z', 'a', 'm') == 'm');
  CHECK(clamp_value('c', 'a', 'm') == 'c');
}

static void test_string() {
  CHECK(clamp_value(std::string("mango"), std::string("apple"), std::string("kiwi")) == std::string("kiwi"));
  CHECK(clamp_value(std::string("banana"), std::string("apple"), std::string("kiwi")) == std::string("banana"));
}

static void test_boundaries() {
  CHECK(clamp_value(0, 0, 10) == 0);
  CHECK(clamp_value(10, 0, 10) == 10);
}

int main() {
  test_int();
  test_double();
  test_char();
  test_string();
  test_boundaries();
  return REPORT();
}
