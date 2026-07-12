// Reference solution for class-bank-account.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

class BankAccount {
 public:
  BankAccount() : balance_(0) {}
  explicit BankAccount(long long opening) : balance_(opening < 0 ? 0 : opening) {}

  long long balance() const { return balance_; }

  // Returns true when the deposit was accepted (amount > 0).
  bool deposit(long long amount) {
    if (amount <= 0) {
      return false;
    }
    balance_ += amount;
    return true;
  }

  // Returns true when the withdrawal succeeded (0 < amount <= balance).
  bool withdraw(long long amount) {
    if (amount <= 0 || amount > balance_) {
      return false;
    }
    balance_ -= amount;
    return true;
  }

 private:
  long long balance_;
};
