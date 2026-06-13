// Exercise: stl-text-stats
// Implement simple word statistics over a block of text using STL containers.
//
// Rules:
//  - `analyze(text)` splits `text` into words on whitespace, lowercases each
//    word (ASCII A-Z -> a-z), and returns the total word count plus a
//    word -> count map.
//  - `top_n(stats, n)` returns the n most frequent words as (word, count) pairs,
//    sorted by count descending, breaking ties by word ascending (lexicographic).
//    If n exceeds the number of distinct words, return all of them.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <map>
#include <string>
#include <utility>
#include <vector>

struct WordStats {
  int word_count = 0;
  std::map<std::string, int> freq;
};

inline WordStats analyze(const std::string& text) {
  // TODO: split on whitespace, lowercase each word, count words and frequencies.
  (void)text;
  return WordStats{};
}

inline std::vector<std::pair<std::string, int>> top_n(const WordStats& stats, int n) {
  // TODO: return the top-n (word, count) pairs, count desc then word asc.
  (void)stats;
  (void)n;
  return {};
}
