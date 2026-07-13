// Reference solution for string-anagram-groups.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <map>
#include <string>
#include <vector>

// Group words that are anagrams of each other. Within each group the words are
// sorted ascending (duplicates kept); the groups are sorted by their first word.
inline std::vector<std::vector<std::string>> group_anagrams(const std::vector<std::string>& words) {
  std::map<std::string, std::vector<std::string>> groups;
  for (const std::string& word : words) {
    std::string key = word;
    std::sort(key.begin(), key.end());
    groups[key].push_back(word);
  }

  std::vector<std::vector<std::string>> result;
  result.reserve(groups.size());
  for (auto& [key, members] : groups) {
    std::sort(members.begin(), members.end());
    result.push_back(members);
  }
  std::sort(result.begin(), result.end(),
            [](const std::vector<std::string>& a, const std::vector<std::string>& b) {
              return a.front() < b.front();
            });
  return result;
}
