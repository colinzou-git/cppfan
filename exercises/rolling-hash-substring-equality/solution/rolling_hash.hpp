// Reference solution for rolling-hash-substring-equality.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

// Precomputes polynomial prefix hashes so any two equal-length substrings can be
// compared in O(1). Uses 64-bit natural (mod 2^64) arithmetic.
class RollingHash {
 public:
  explicit RollingHash(const std::string& s) : n_(s.size()), prefix_(s.size() + 1, 0), power_(s.size() + 1, 1) {
    for (std::size_t i = 0; i < n_; ++i) {
      prefix_[i + 1] = prefix_[i] * kBase + static_cast<std::uint64_t>(static_cast<unsigned char>(s[i])) + 1;
      power_[i + 1] = power_[i] * kBase;
    }
  }

  // True when s[a, a+len) == s[b, b+len). len == 0 is trivially equal; a range
  // that runs off the end of the string is never equal.
  bool equal(std::size_t a, std::size_t b, std::size_t len) const {
    if (len == 0) {
      return true;
    }
    if (a + len > n_ || b + len > n_) {
      return false;
    }
    return hash(a, len) == hash(b, len);
  }

 private:
  std::uint64_t hash(std::size_t start, std::size_t len) const {
    return prefix_[start + len] - prefix_[start] * power_[len];
  }

  static constexpr std::uint64_t kBase = 1315423911ULL;
  std::size_t n_;
  std::vector<std::uint64_t> prefix_;
  std::vector<std::uint64_t> power_;
};
