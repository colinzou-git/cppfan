// Reference solution for array-plus-one.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline std::vector<int> plus_one(std::vector<int> digits) {
  for (int i = static_cast<int>(digits.size()) - 1; i >= 0; --i) {
    if (digits[i] < 9) {
      ++digits[i];
      return digits;  // no carry out of this digit; done
    }
    digits[i] = 0;  // 9 + 1 == 10; write 0 and carry left
  }
  digits.insert(digits.begin(), 1);  // all nines: number grew a digit
  return digits;
}
