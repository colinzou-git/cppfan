// Exercise: dsa-count-set-bits
// Count the number of 1 bits in an unsigned integer (its Hamming weight).
//
// Rules:
//  - `count_set_bits(n)` returns how many bits are set to 1 in `n`.
//  - count_set_bits(0) is 0; count_set_bits(0xFFFFFFFF) is 32.
//  - Use bit operations (no string conversion). A neat O(set-bits) approach is
//    Brian Kernighan's trick: `n &= (n - 1)` clears the lowest set bit.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline int count_set_bits(unsigned int n) {
  // TODO: repeatedly clear the lowest set bit (n &= n - 1) and count the steps,
  // or shift and test the low bit.
  (void)n;
  return 0;
}
