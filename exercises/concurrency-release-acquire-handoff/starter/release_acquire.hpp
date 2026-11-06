#pragma once
#include <atomic>
#include <thread>
#include <vector>

inline std::vector<int> release_acquire_handoff(int n) {
  // TODO: producer fills values 1,4,7,...; release store publishes.
  // Consumer performs acquire load and copies the published vector.
  (void)n;
  return {};
}
