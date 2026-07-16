// Reference solution for bit-power-of-two.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

inline bool is_power_of_two(int n) {
  return n > 0 && (n & (n - 1)) == 0;
}
