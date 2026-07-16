// Exercise: array-majority-element
// Return the majority element of an array: the value that appears MORE than n/2
// times. It is guaranteed to exist.
//
// Rules:
//  - `majority_element(nums)` returns the value occurring more than n/2 times.
//  - Boyer-Moore voting runs in O(n) time and O(1) space.
//  - Keep a candidate + count; count++ on a match, count-- otherwise; adopt a new
//    candidate when count reaches 0.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int majority_element(const std::vector<int>& nums) {
  // TODO: Boyer-Moore voting; return the surviving candidate.
  (void)nums;
  return 0;
}
