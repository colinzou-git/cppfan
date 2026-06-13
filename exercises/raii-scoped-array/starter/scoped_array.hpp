// Exercise: raii-scoped-array
// Implement a resource-safe, move-only owner of a heap int array.
//
// Rules:
//  - The constructor allocates `size` ints (value-initialized to 0).
//  - The destructor frees them exactly once.
//  - The type is MOVE-ONLY: copying is deleted; moving transfers ownership and
//    leaves the moved-from object empty (size 0, no owned memory).
//  - `live()` returns how many ScopedArray objects currently own memory; it must
//    return to its prior value once every ScopedArray in a scope is destroyed.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <cstddef>

class ScopedArray {
 public:
  explicit ScopedArray(std::size_t size) {
    // TODO: allocate `size` zero-initialized ints, store size, and track live().
    (void)size;
  }

  ~ScopedArray() {
    // TODO: free the owned memory (only if this object still owns it).
  }

  // Move-only.
  ScopedArray(const ScopedArray&) = delete;
  ScopedArray& operator=(const ScopedArray&) = delete;

  ScopedArray(ScopedArray&& other) noexcept {
    // TODO: steal other's buffer and size; leave other empty.
    (void)other;
  }

  ScopedArray& operator=(ScopedArray&& other) noexcept {
    // TODO: free current resource, steal other's, leave other empty.
    (void)other;
    return *this;
  }

  std::size_t size() const {
    return 0;  // TODO
  }

  int& at(std::size_t i) {
    static int dummy = 0;  // TODO: return a reference to element i.
    (void)i;
    return dummy;
  }

  // Number of ScopedArray objects that currently own memory.
  static int live() {
    return 0;  // TODO: track this across construction/destruction/move.
  }
};
