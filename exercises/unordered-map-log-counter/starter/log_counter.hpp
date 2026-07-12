// Exercise: unordered-map-log-counter
// Tally event names in a hash map and answer simple frequency questions.
//
// Rules:
//  - record(event): increment that event's tally.
//  - count(event): how many times it was recorded (0 if never).
//  - distinct(): number of different event names seen.
//  - most_frequent(): the event with the highest tally; break ties by the
//    lexicographically smallest name. Return "" when nothing was recorded.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <unordered_map>

class LogCounter {
 public:
  void record(const std::string& event) {
    // TODO: increment the tally for event.
    (void)event;
  }

  int count(const std::string& event) const {
    // TODO: look up event; return 0 when absent.
    (void)event;
    return 0;
  }

  int distinct() const {
    // TODO: number of distinct events.
    return 0;
  }

  std::string most_frequent() const {
    // TODO: highest tally; ties -> smallest name; "" when empty.
    return "";
  }

 private:
  std::unordered_map<std::string, int> counts_;
};
