#pragma once
#include <atomic>
#include <condition_variable>
#include <mutex>
#include <stop_token>
#include <thread>
#include <vector>

inline int count_cooperative_stops(int workers) {
  // TODO: create jthread workers; wait for stop, request_stop and join everyone.
  (void)workers;
  return 0;
}
