// Tests for variant-json-token. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "json_token.hpp"

static void test_kind() {
  CHECK(kind(JsonToken{nullptr}) == "null");
  CHECK(kind(JsonToken{true}) == "boolean");
  CHECK(kind(JsonToken{3.14}) == "number");
  CHECK(kind(JsonToken{std::string("hi")}) == "string");
}

static void test_truthy_null_and_bool() {
  CHECK(!truthy(JsonToken{nullptr}));
  CHECK(truthy(JsonToken{true}));
  CHECK(!truthy(JsonToken{false}));
}

static void test_truthy_number() {
  CHECK(truthy(JsonToken{1.0}));
  CHECK(truthy(JsonToken{-2.5}));
  CHECK(!truthy(JsonToken{0.0}));
}

static void test_truthy_string() {
  CHECK(truthy(JsonToken{std::string("x")}));
  CHECK(!truthy(JsonToken{std::string("")}));
}

int main() {
  test_kind();
  test_truthy_null_and_bool();
  test_truthy_number();
  test_truthy_string();
  return REPORT();
}
