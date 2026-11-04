#pragma once
#include <exception>
#include <future>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

inline std::vector<std::string> parallel_square_results(const std::vector<int>& values) {
  std::vector<std::promise<long long>> promises(values.size());
  std::vector<std::future<long long>> futures;
  futures.reserve(values.size());
  for (auto& promise : promises) futures.emplace_back(promise.get_future());

  std::vector<std::thread> threads;
  threads.reserve(values.size());
  for (std::size_t i = 0; i < values.size(); ++i) {
    threads.emplace_back([&, i] {
      try {
        if (values[i] < 0) throw std::invalid_argument("negative job input");
        promises[i].set_value(1LL * values[i] * values[i]);
      } catch (...) {
        promises[i].set_exception(std::current_exception());
      }
    });
  }
  for (auto& thread : threads) thread.join();

  std::vector<std::string> results;
  results.reserve(values.size());
  for (auto& future : futures) {
    try {
      results.push_back(std::to_string(future.get()));
    } catch (const std::exception&) {
      results.emplace_back("error");
    }
  }
  return results;
}
