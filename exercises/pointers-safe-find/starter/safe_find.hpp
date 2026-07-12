// Exercise: pointers-safe-find
// Return non-owning pointers into a vector, or nullptr when there is no match.
//
// Rules:
//  - find_first: return a const pointer to the first element equal to target,
//    or nullptr if none exists. Do not copy the element.
//  - find_first_mutable: same, but return a non-const pointer so the caller can
//    edit the element in place.
//  - contains: true when a matching element exists.
//  - Return pointers INTO the caller's vector; never return the address of a
//    local copy (that would dangle).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline const int* find_first(const std::vector<int>& values, int target) {
  // TODO: return the address of the first matching element, or nullptr.
  (void)values;
  (void)target;
  return nullptr;
}

inline int* find_first_mutable(std::vector<int>& values, int target) {
  // TODO: like find_first, but allow the caller to modify the element.
  (void)values;
  (void)target;
  return nullptr;
}

inline bool contains(const std::vector<int>& values, int target) {
  // TODO: reuse find_first.
  (void)values;
  (void)target;
  return false;
}
