// Exercise: value-semantics-deep-copy-buffer
// Give an owning int buffer full value semantics (the rule of five).
//
// Rules:
//  - Buffer(n) allocates n ints, zero-initialized (n == 0 owns no memory).
//  - Copy constructor / copy assignment make a DEEP copy: the copy has its own
//    independent memory. Copy assignment must be self-assignment safe and must
//    not leak the old buffer.
//  - Move constructor / move assignment steal the pointer and leave the source
//    empty (size 0, no memory) but valid.
//  - The destructor frees the memory (exactly once — no leaks, no double free).
//  - size() and at() are observers/accessors.
//
// The tests run under AddressSanitizer, so leaks and double-frees will fail.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <cstddef>

class Buffer {
 public:
  explicit Buffer(std::size_t n) : size_(n), data_(n > 0 ? new int[n]() : nullptr) {}

  Buffer(const Buffer& other) : size_(0), data_(nullptr) {
    // TODO: deep copy other's contents.
    (void)other;
  }

  Buffer& operator=(const Buffer& other) {
    // TODO: deep copy, self-assignment safe, no leak.
    (void)other;
    return *this;
  }

  Buffer(Buffer&& other) noexcept : size_(0), data_(nullptr) {
    // TODO: steal other's buffer, leaving it empty.
    (void)other;
  }

  Buffer& operator=(Buffer&& other) noexcept {
    // TODO: release ours, steal other's, leave it empty.
    (void)other;
    return *this;
  }

  ~Buffer() {
    // TODO: free the memory.
  }

  std::size_t size() const { return size_; }
  int& at(std::size_t i) { return data_[i]; }
  const int& at(std::size_t i) const { return data_[i]; }

 private:
  std::size_t size_;
  int* data_;
};
