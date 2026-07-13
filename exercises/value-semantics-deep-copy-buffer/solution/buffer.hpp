// Reference solution for value-semantics-deep-copy-buffer.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <cstddef>

// An owning int buffer with full value semantics (the rule of five): deep copy,
// safe move, and destructor. Copies are independent; moves leave the source
// empty but valid.
class Buffer {
 public:
  explicit Buffer(std::size_t n) : size_(n), data_(n > 0 ? new int[n]() : nullptr) {}

  Buffer(const Buffer& other) : size_(other.size_), data_(other.size_ > 0 ? new int[other.size_] : nullptr) {
    std::copy(other.data_, other.data_ + other.size_, data_);
  }

  Buffer& operator=(const Buffer& other) {
    if (this != &other) {
      int* fresh = other.size_ > 0 ? new int[other.size_] : nullptr;
      std::copy(other.data_, other.data_ + other.size_, fresh);
      delete[] data_;
      data_ = fresh;
      size_ = other.size_;
    }
    return *this;
  }

  Buffer(Buffer&& other) noexcept : size_(other.size_), data_(other.data_) {
    other.size_ = 0;
    other.data_ = nullptr;
  }

  Buffer& operator=(Buffer&& other) noexcept {
    if (this != &other) {
      delete[] data_;
      size_ = other.size_;
      data_ = other.data_;
      other.size_ = 0;
      other.data_ = nullptr;
    }
    return *this;
  }

  ~Buffer() { delete[] data_; }

  std::size_t size() const { return size_; }
  int& at(std::size_t i) { return data_[i]; }
  const int& at(std::size_t i) const { return data_[i]; }

 private:
  std::size_t size_;
  int* data_;
};
