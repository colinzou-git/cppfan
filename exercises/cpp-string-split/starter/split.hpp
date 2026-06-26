// Exercise: cpp-string-split
// Split a string into fields on a delimiter character, keeping empty fields.
//
// Rules:
//  - `split(s, delim)` returns the substrings between each occurrence of `delim`.
//  - Empty fields are kept: split("a,,b", ',') is {"a", "", "b"}.
//  - The result always has (number of delimiters + 1) entries, so split("", ',')
//    is {""} and split("a,", ',') is {"a", ""}.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline std::vector<std::string> split(const std::string& s, char delim) {
  // TODO: accumulate characters into the current field; on a delimiter, push the
  // field and start a new one. Push the final field after the loop.
  (void)s;
  (void)delim;
  return {};
}
