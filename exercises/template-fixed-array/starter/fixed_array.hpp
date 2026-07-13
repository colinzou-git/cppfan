// Exercise: template-fixed-array
// Implement a small fixed-size array CLASS template.
//
// Rules:
//  - FixedArray<T, N> stores N elements of type T, value-initialized to T{}.
//  - size() returns N (make it constexpr).
//  - operator[] gives read and write access (const and non-const overloads).
//  - fill(value) sets every element to value.
//  - sum() returns the total of all elements (using operator+ and T{} as zero).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <cstddef>

template <typename T, std::size_t N>
class FixedArray {
 public:
  constexpr std::size_t size() const { return N; }

  T& operator[](std::size_t i) { return data_[i]; }
  const T& operator[](std::size_t i) const { return data_[i]; }

  void fill(const T& value) {
    // TODO: set every element to value.
    (void)value;
  }

  T sum() const {
    // TODO: accumulate all elements starting from T{}.
    return T{};
  }

 private:
  T data_[N]{};
};
