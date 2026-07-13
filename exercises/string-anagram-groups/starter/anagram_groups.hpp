// Exercise: string-anagram-groups
// Group words that are anagrams of one another.
//
// Rules:
//  - Two words are anagrams when their sorted characters are equal (case- and
//    character-sensitive; compare bytes as-is).
//  - Within each group, sort the words ascending (keep duplicates).
//  - Sort the groups by their first (smallest) word, ascending.
//  - An empty input yields an empty result.
//
// Hint: a map keyed by the sorted-letter signature collects each group.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <map>
#include <string>
#include <vector>

inline std::vector<std::vector<std::string>> group_anagrams(const std::vector<std::string>& words) {
  // TODO: bucket words by their sorted-letter key, then sort within and across
  // groups for a deterministic result.
  (void)words;
  return {};
}
