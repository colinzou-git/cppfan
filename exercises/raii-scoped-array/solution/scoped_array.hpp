// Reference solution for raii-scoped-array.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <utility>

class ScopedArray {
 public:
  explicit ScopedArray(std::size_t size) : data_(new int[size]()), size_(size) {
    ++live_count_;
  }

  ~ScopedArray() {
    if (data_ != nullptr) {
      delete[] data_;
      --live_count_;
    }
  }

  ScopedArray(const ScopedArray&) = delete;
  ScopedArray& operator=(const ScopedArray&) = delete;

  ScopedArray(ScopedArray&& other) noexcept : data_(other.data_), size_(other.size_) {
    other.data_ = nullptr;
    other.size_ = 0;
  }

  ScopedArray& operator=(ScopedArray&& other) noexcept {
    if (this != &other) {
      if (data_ != nullptr) {
        delete[] data_;
        --live_count_;
      }
      data_ = other.data_;
      size_ = other.size_;
      other.data_ = nullptr;
      other.size_ = 0;
    }
    return *this;
  }

  std::size_t size() const { return size_; }

  int& at(std::size_t i) { return data_[i]; }

  static int live() { return live_count_; }

 private:
  int* data_ = nullptr;
  std::size_t size_ = 0;
  static inline int live_count_ = 0;
};
