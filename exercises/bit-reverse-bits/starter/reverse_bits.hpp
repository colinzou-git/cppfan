// Exercise: bit-reverse-bits
// Reverse the 32 bits of an unsigned integer (bit 0 <-> bit 31, and so on).
//
// Rules:
//  - `reverse_bits(n)` returns the value whose bit pattern is n's reversed.
//  - Loop over all 32 positions, building the result one bit at a time.
//  - Use an unsigned 32-bit type so shifts do not sign-extend.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <cstdint>

inline uint32_t reverse_bits(uint32_t n) {
  // TODO: for 32 iterations, shift result left, OR in n's lowest bit, shift n right.
  (void)n;
  return 0;
}
