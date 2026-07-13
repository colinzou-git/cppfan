// Exercise: template-generic-clamp
// Write ONE function template that clamps any comparable type into a range.
//
// Rules:
//  - clamp_value(value, lo, hi) returns lo if value < lo, hi if value > hi, else
//    value.
//  - It must be a template so it works for int, double, char, std::string, etc.
//  - Rely only on operator< so it works for any ordered type (compare with < only).
//  - Assume lo <= hi.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

template <typename T>
T clamp_value(const T& value, const T& lo, const T& hi) {
  // TODO: return the value pinned into [lo, hi] using only operator<.
  (void)lo;
  (void)hi;
  return value;
}
