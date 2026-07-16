// Reference solution for bit-reverse-bits.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstdint>

inline uint32_t reverse_bits(uint32_t n) {
  uint32_t result = 0;
  for (int i = 0; i < 32; ++i) {
    result = (result << 1) | (n & 1u);
    n >>= 1;
  }
  return result;
}
