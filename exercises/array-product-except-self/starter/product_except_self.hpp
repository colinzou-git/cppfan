// Exercise: array-product-except-self
// For each index, compute the product of all OTHER elements.
//
// Rules:
//  - result[i] = product of every nums[j] where j != i.
//  - Do NOT use division (it breaks on zeros anyway).
//  - Run in O(n) using running prefix and suffix products.
//  - An empty vector returns an empty vector.
//  - Results use long long to avoid overflow on the products.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<long long> product_except_self(const std::vector<int>& nums) {
  // TODO: first pass fills result[i] with the product of everything to the left;
  // second pass multiplies in the product of everything to the right.
  (void)nums;
  return {};
}
