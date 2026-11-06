#pragma once
#include <mutex>
#include <optional>
#include <shared_mutex>
#include <string>
#include <unordered_map>

class SharedRegistry {
 public:
  void put(int key, std::string value) {
    // TODO: acquire an exclusive lock and write the map.
    (void)key;
    (void)value;
  }
  std::optional<std::string> get(int key) const {
    // TODO: acquire a shared lock; return a copied value or nullopt.
    (void)key;
    return std::nullopt;
  }
  std::size_t size() const {
    // TODO: read size under a shared lock.
    return 0;
  }

 private:
  mutable std::shared_mutex mutex_;
  std::unordered_map<int, std::string> values_;
};
