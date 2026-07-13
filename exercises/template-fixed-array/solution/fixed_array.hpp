// Reference solution for template-fixed-array.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>

// A minimal fixed-size array template parameterized on element type and size.
template <typename T, std::size_t N>
class FixedArray {
 public:
  constexpr std::size_t size() const { return N; }

  T& operator[](std::size_t i) { return data_[i]; }
  const T& operator[](std::size_t i) const { return data_[i]; }

  void fill(const T& value) {
    for (std::size_t i = 0; i < N; ++i) {
      data_[i] = value;
    }
  }

  T sum() const {
    T total{};
    for (std::size_t i = 0; i < N; ++i) {
      total = total + data_[i];
    }
    return total;
  }

 private:
  T data_[N]{};
};
