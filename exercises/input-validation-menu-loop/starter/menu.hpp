// Exercise: input-validation-menu-loop
// Scan a list of raw menu inputs and return the first VALID choice.
//
// Rules:
//  - A valid choice is an integer in [1, 4] that fills the whole token
//    (no extra characters, no surrounding spaces).
//  - Skip invalid entries (non-numeric, out of range, empty).
//  - Return the first valid choice, or -1 if none is valid.
//
// This models a real menu loop that keeps prompting until it gets good input.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline int first_valid_choice(const std::vector<std::string>& inputs) {
  // TODO: validate each token (whole-string integer in [1,4]); return the first.
  (void)inputs;
  return -1;
}
