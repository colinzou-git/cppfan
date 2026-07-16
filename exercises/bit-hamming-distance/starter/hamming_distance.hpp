// Exercise: bit-hamming-distance
// Return the Hamming distance between two non-negative integers: the number of
// bit positions at which their binary representations differ.
//
// Rules:
//  - `hamming_distance(a, b)` returns how many bits differ between a and b.
//  - XOR marks the differing positions: hamming(a, b) == popcount(a ^ b).
//  - Count the set bits of (a ^ b), e.g. clearing the lowest bit with x &= x-1.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline int hamming_distance(int a, int b) {
  // TODO: XOR the inputs, then count the set bits of the result.
  (void)a;
  (void)b;
  return 0;
}
