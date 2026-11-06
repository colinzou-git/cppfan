#pragma once
#include <mutex>

struct TransferAccount {
  explicit TransferAccount(long long starting) : balance(starting) {}
  long long balance;
  std::mutex mutex;
};

inline bool transfer_funds(TransferAccount& from, TransferAccount& to, long long amount) {
  if (amount < 0) return false;
  if (&from == &to) return true;
  std::scoped_lock lock(from.mutex, to.mutex);
  if (from.balance < amount) return false;
  from.balance -= amount;
  to.balance += amount;
  return true;
}
