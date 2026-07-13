// Exercise: rolling-hash-substring-equality
// Precompute polynomial prefix hashes so any two equal-length substrings can be
// compared in O(1).
//
// Rules:
//  - Build prefix hashes in the constructor: prefix[i+1] = prefix[i]*BASE + s[i]
//    (offset each byte by +1 so leading zero-bytes are distinguishable), and
//    precompute BASE powers. Use 64-bit unsigned (natural mod 2^64) arithmetic.
//  - equal(a, b, len): true when s[a, a+len) == s[b, b+len).
//      * len == 0 is trivially equal.
//      * If a+len or b+len runs past the end, return false.
//      * Otherwise compare the two substring hashes:
//          hash(start, len) = prefix[start+len] - prefix[start] * power[len].
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

class RollingHash {
 public:
  explicit RollingHash(const std::string& s) : n_(s.size()), prefix_(s.size() + 1, 0), power_(s.size() + 1, 1) {
    // TODO: fill prefix_ and power_ from s.
    (void)s;
  }

  bool equal(std::size_t a, std::size_t b, std::size_t len) const {
    // TODO: handle len == 0 and out-of-range, then compare substring hashes.
    (void)a; (void)b; (void)len;
    return false;
  }

 private:
  static constexpr std::uint64_t kBase = 1315423911ULL;
  std::size_t n_;
  std::vector<std::uint64_t> prefix_;
  std::vector<std::uint64_t> power_;
};
