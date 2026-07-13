// Exercise: csv-row-parser
// Split one CSV row into its fields, handling quoted fields.
//
// Rules:
//  - Fields are separated by commas.
//  - A field may be wrapped in double quotes. Inside quotes, a comma is a
//    literal character (not a separator).
//  - Inside a quoted field, "" (two double quotes) is an escaped double quote.
//  - A quote only starts a quoted field when it is the first character of the
//    field; elsewhere it is a literal character.
//  - An empty line is a single empty field: {""}. "a,,c" is {"a","","c"}.
//
// This is naturally a small character-by-character state machine.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline std::vector<std::string> parse_csv_row(const std::string& line) {
  // TODO: scan character by character, tracking whether you are inside quotes,
  // and push a field on each unquoted comma.
  (void)line;
  return {};
}
