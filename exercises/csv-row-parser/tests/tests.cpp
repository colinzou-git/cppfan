// Tests for csv-row-parser. Build with -I _harness and the impl dir.
#include <string>
#include <vector>

#include "check.hpp"
#include "csv_parser.hpp"

using Row = std::vector<std::string>;

static void test_plain_fields() {
  CHECK((parse_csv_row("a,b,c") == Row{"a", "b", "c"}));
}

static void test_quoted_comma() {
  CHECK((parse_csv_row("a,\"b,c\",d") == Row{"a", "b,c", "d"}));
}

static void test_escaped_quotes() {
  // Input: "he said ""hi""",x  -> he said "hi" | x
  CHECK((parse_csv_row("\"he said \"\"hi\"\"\",x") == Row{"he said \"hi\"", "x"}));
}

static void test_empty_fields() {
  CHECK((parse_csv_row("a,,c") == Row{"a", "", "c"}));
  CHECK((parse_csv_row("") == Row{""}));
}

static void test_trailing_empty_field() {
  CHECK((parse_csv_row("a,b,") == Row{"a", "b", ""}));
}

static void test_quote_not_at_field_start_is_literal() {
  CHECK((parse_csv_row("a\"b,c") == Row{"a\"b", "c"}));
}

int main() {
  test_plain_fields();
  test_quoted_comma();
  test_escaped_quotes();
  test_empty_fields();
  test_trailing_empty_field();
  test_quote_not_at_field_start_is_literal();
  return REPORT();
}
