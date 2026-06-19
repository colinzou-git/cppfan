// Exercise: trie-autocomplete
// Build a small autocomplete index over strings.
//
// Rules:
//  - insert(word) adds a word; duplicates should not duplicate suggestions.
//  - contains(word) checks exact membership.
//  - suggestions(prefix, limit) returns up to limit lexicographically sorted
//    words that start with prefix.
//  - limit <= 0 returns no suggestions.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

class AutocompleteIndex {
 public:
  explicit AutocompleteIndex(const std::vector<std::string>& words) {
    (void)words;
  }

  void insert(const std::string& word) {
    (void)word;
  }

  bool contains(const std::string& word) const {
    (void)word;
    return false;
  }

  std::vector<std::string> suggestions(const std::string& prefix, int limit) const {
    (void)prefix;
    (void)limit;
    return {};
  }
};
