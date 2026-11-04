#pragma once
#include <exception>
#include <future>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

inline std::vector<std::string> parallel_square_results(const std::vector<int>& values) {
  // TODO: each worker sets a value or exception on a promise.
  (void)values;
  return {};
}
