#pragma once

#include <cstddef>
#include <mutex>
#include <optional>
#include <queue>
#include <string>

struct Task {
  int id;
  std::string payload;
};

class BoundedTaskQueue {
public:
  explicit BoundedTaskQueue(std::size_t capacity) : capacity_(capacity) {}

  bool push(Task task) {
    (void)task;
    std::lock_guard<std::mutex> lock(mutex_);
    return false;
  }

  std::optional<Task> pop() {
    std::lock_guard<std::mutex> lock(mutex_);
    return std::nullopt;
  }

  void close() {
    std::lock_guard<std::mutex> lock(mutex_);
    closed_ = true;
  }

  std::size_t size() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return queue_.size();
  }

  std::size_t capacity() const {
    return capacity_;
  }

  bool closed() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return closed_;
  }

private:
  const std::size_t capacity_;
  mutable std::mutex mutex_;
  std::queue<Task> queue_;
  bool closed_ = false;
};
