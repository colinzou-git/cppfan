#pragma once

#include <condition_variable>
#include <cstddef>
#include <mutex>
#include <optional>
#include <queue>
#include <stdexcept>
#include <string>

struct Task {
  int id;
  std::string payload;
};

class BoundedTaskQueue {
public:
  explicit BoundedTaskQueue(std::size_t capacity) : capacity_(capacity) {
    if (capacity_ == 0) {
      throw std::invalid_argument("capacity must be positive");
    }
  }

  bool push(Task task) {
    std::unique_lock<std::mutex> lock(mutex_);
    not_full_.wait(lock, [this] { return closed_ || queue_.size() < capacity_; });
    if (closed_) {
      return false;
    }
    queue_.push(std::move(task));
    not_empty_.notify_one();
    return true;
  }

  std::optional<Task> pop() {
    std::unique_lock<std::mutex> lock(mutex_);
    not_empty_.wait(lock, [this] { return closed_ || !queue_.empty(); });
    if (queue_.empty()) {
      return std::nullopt;
    }
    Task task = std::move(queue_.front());
    queue_.pop();
    not_full_.notify_one();
    return task;
  }

  void close() {
    {
      std::lock_guard<std::mutex> lock(mutex_);
      closed_ = true;
    }
    not_empty_.notify_all();
    not_full_.notify_all();
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
  std::condition_variable not_empty_;
  std::condition_variable not_full_;
  std::queue<Task> queue_;
  bool closed_ = false;
};
