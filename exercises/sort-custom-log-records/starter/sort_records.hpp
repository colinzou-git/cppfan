// Exercise: sort-custom-log-records
// Rank records with a custom multi-key comparator.
//
// Rules:
//  - Sort by score DESCENDING (higher score first).
//  - Break ties by name ASCENDING (lexicographic).
//  - Records equal on both keys must keep their original relative order (use a
//    STABLE sort).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <string>
#include <vector>

struct Record {
  std::string name;
  int score;
};

inline bool operator==(const Record& a, const Record& b) {
  return a.name == b.name && a.score == b.score;
}

inline std::vector<Record> sort_records(std::vector<Record> records) {
  // TODO: std::stable_sort with a comparator: score desc, then name asc.
  return records;
}
