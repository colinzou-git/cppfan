// Reference solution for strings-reverse-words.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <sstream>
#include <string>
#include <vector>

inline std::string reverse_words(const std::string& text) {
  std::istringstream in(text);
  std::vector<std::string> words;
  std::string word;
  while (in >> word) {
    words.push_back(word);
  }
  std::string out;
  for (std::size_t i = words.size(); i > 0; --i) {
    if (!out.empty()) {
      out += ' ';
    }
    out += words[i - 1];
  }
  return out;
}
