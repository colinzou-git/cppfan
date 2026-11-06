#pragma once
#include <mutex>

struct TransferAccount {
  explicit TransferAccount(long long starting) : balance(starting) {}
  long long balance;
  std::mutex mutex;
};

inline bool transfer_funds(TransferAccount& from, TransferAccount& to, long long amount) {
  // TODO: reject negatives, handle self-transfer, acquire both mutexes and transfer.
  (void)from;
  (void)to;
  (void)amount;
  return false;
}
