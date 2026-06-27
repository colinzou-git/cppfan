#pragma once

class AccountState {
  long long value_ = 0;

 public:
  explicit AccountState(long long initial) : value_(initial < 0 ? 0 : initial) {}
  bool add(long long amount) {
    if (amount < 0) return false;
    value_ += amount;
    return true;
  }
  bool remove(long long amount) {
    if (amount < 0 || amount > value_) return false;
    value_ -= amount;
    return true;
  }
  long long value() const { return value_; }
};
