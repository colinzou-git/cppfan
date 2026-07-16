// Exercise: strings-reverse-words
// Reverse the ORDER of the words in a sentence. Words are runs of non-space
// characters; collapse any run of spaces to a single separator and drop leading
// and trailing spaces.
//
// Rules:
//  - `reverse_words("the sky is blue")` returns "blue is sky the".
//  - Multiple/leading/trailing spaces are normalized to single spaces with none
//    at the ends.
//  - An input with no words returns "".
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline std::string reverse_words(const std::string& text) {
  // TODO: extract words (istringstream >> word), then join them in reverse
  // order with single spaces.
  (void)text;
  return "";
}
