// Reference solution for template-generic-clamp.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

// A generic clamp that works for any type supporting operator<.
template <typename T>
T clamp_value(const T& value, const T& lo, const T& hi) {
  if (value < lo) {
    return lo;
  }
  if (hi < value) {
    return hi;
  }
  return value;
}
