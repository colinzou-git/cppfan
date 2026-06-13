// Reference solution for stl-text-stats.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <cctype>
#include <map>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

struct WordStats {
  int word_count = 0;
  std::map<std::string, int> freq;
};

inline WordStats analyze(const std::string& text) {
  WordStats stats;
  std::istringstream in(text);
  std::string word;
  while (in >> word) {
    for (char& c : word) {
      c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    }
    ++stats.word_count;
    ++stats.freq[word];
  }
  return stats;
}

inline std::vector<std::pair<std::string, int>> top_n(const WordStats& stats, int n) {
  std::vector<std::pair<std::string, int>> items(stats.freq.begin(), stats.freq.end());
  std::sort(items.begin(), items.end(), [](const auto& a, const auto& b) {
    if (a.second != b.second) {
      return a.second > b.second;  // count descending
    }
    return a.first < b.first;  // word ascending
  });
  if (n >= 0 && static_cast<std::size_t>(n) < items.size()) {
    items.resize(static_cast<std::size_t>(n));
  }
  return items;
}
