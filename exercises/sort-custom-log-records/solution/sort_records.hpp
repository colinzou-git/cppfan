// Reference solution for sort-custom-log-records.
// Kept out of the learner-facing default path; do not reveal before completion.
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

// Rank records by score descending, breaking ties by name ascending. A stable
// sort keeps the input order for records that are equal on both keys.
inline std::vector<Record> sort_records(std::vector<Record> records) {
  std::stable_sort(records.begin(), records.end(), [](const Record& a, const Record& b) {
    if (a.score != b.score) {
      return a.score > b.score;  // higher score first
    }
    return a.name < b.name;  // then name ascending
  });
  return records;
}
