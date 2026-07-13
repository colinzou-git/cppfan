// Reference solution for dp-house-robber.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

// Maximum total you can take without robbing two adjacent houses.
inline long long rob(const std::vector<int>& houses) {
  long long take = 0;  // best if we consider up to i and may take house i
  long long skip = 0;  // best if we consider up to i and skip house i
  for (int value : houses) {
    const long long new_take = skip + value;
    const long long new_skip = take > skip ? take : skip;
    take = new_take;
    skip = new_skip;
  }
  return take > skip ? take : skip;
}
