#pragma once
#include <mutex>
#include <optional>
#include <shared_mutex>
#include <string>
#include <unordered_map>

class SharedRegistry {
 public:
  void put(int key, std::string value) {
    std::unique_lock<std::shared_mutex> lock(mutex_);
    values_[key] = std::move(value);
  }
  std::optional<std::string> get(int key) const {
    std::shared_lock<std::shared_mutex> lock(mutex_);
    const auto it = values_.find(key);
    if (it == values_.end()) return std::nullopt;
    return it->second;
  }
  std::size_t size() const {
    std::shared_lock<std::shared_mutex> lock(mutex_);
    return values_.size();
  }

 private:
  mutable std::shared_mutex mutex_;
  std::unordered_map<int, std::string> values_;
};
