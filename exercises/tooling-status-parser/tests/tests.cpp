// Tests for tooling-status-parser. Build with -I _harness and the implementation dir.
#include "check.hpp"
#include "status_parser.hpp"

static void test_parses_ok_status() {
  ParseResult r = parse_status_line("OK 200 ready");
  CHECK(r.ok);
  CHECK(r.code == 200);
  CHECK(r.message == "ready");
}

static void test_parses_error_status() {
  ParseResult r = parse_status_line("ERR 404 missing page");
  CHECK(r.ok);
  CHECK(r.code == 404);
  CHECK(r.message == "missing page");
}

static void test_rejects_missing_message_boundary() {
  ParseResult r = parse_status_line("OK 204");
  CHECK(!r.ok);
  CHECK(r.code == -1);
  CHECK(r.message == "malformed");
}

static void test_rejects_negative_code_adversarial() {
  ParseResult r = parse_status_line("ERR -5 impossible");
  CHECK(!r.ok);
  CHECK(r.code == -1);
  CHECK(r.message == "invalid code");
}

static void test_regression_preserves_message_spaces() {
  ParseResult r = parse_status_line("OK 200 ready for retry");
  CHECK(r.ok);
  CHECK(r.message == "ready for retry");
}

int main() {
  test_parses_ok_status();
  test_parses_error_status();
  test_rejects_missing_message_boundary();
  test_rejects_negative_code_adversarial();
  test_regression_preserves_message_spaces();
  return REPORT();
}
