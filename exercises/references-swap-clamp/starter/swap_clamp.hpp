// Exercise: references-swap-clamp
// Practice reference parameters and const-correctness with four tiny functions.
//
// Rules:
//  - swap_ints(a, b): exchange the two ints through references (no return).
//  - clamp_value(value, lo, hi): return value pinned to the [lo, hi] range,
//    taking arguments by value (does not modify the caller).
//  - clamp_in_place(value, hi, lo): clamp `value` through its reference.
//  - max_of(a, b): return the larger, reading through const references
//    (must not modify the arguments).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline void swap_ints(int& a, int& b) {
  // TODO: exchange a and b through their references.
  (void)a;
  (void)b;
}

inline int clamp_value(int value, int lo, int hi) {
  // TODO: return value pinned into [lo, hi].
  (void)lo;
  (void)hi;
  return value;
}

inline void clamp_in_place(int& value, int lo, int hi) {
  // TODO: clamp value through its reference.
  (void)value;
  (void)lo;
  (void)hi;
}

inline int max_of(const int& a, const int& b) {
  // TODO: return the larger without modifying either argument.
  (void)b;
  return a;
}
