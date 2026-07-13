// Exercise: concurrency-producer-consumer
// Coordinate producer and consumer threads through a shared queue.
//
// Rules:
//  - Start `producers` producer threads; each pushes the integers 1..items_each
//    into a shared queue.
//  - Start `consumers` consumer threads; each pops values and adds them to a
//    shared total.
//  - Guard the queue with a mutex and use a condition_variable so consumers
//    block (no busy-waiting) until work arrives or production is finished.
//  - Every produced value is consumed exactly once. Return the total, which must
//    be deterministic: producers * (items_each*(items_each+1)/2).
//  - Consumers must exit cleanly once the queue is drained AND all producers are
//    done (handle producers == 0 without deadlocking).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <atomic>
#include <condition_variable>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>

inline long long producer_consumer_total(int producers, int consumers, int items_each) {
  // TODO: shared queue + mutex + condition_variable; producers push 1..items_each,
  // consumers pop and accumulate; signal completion so consumers stop.
  (void)producers;
  (void)consumers;
  (void)items_each;
  return 0;
}
