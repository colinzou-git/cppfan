// Exercise: class-bank-account
// A small class that protects an invariant: the balance can never go negative.
//
// Rules:
//  - The balance is PRIVATE. Callers touch it only through methods.
//  - BankAccount() starts at balance 0.
//  - BankAccount(opening) starts at `opening`, but a negative opening clamps to 0.
//  - balance() is a const getter.
//  - deposit(amount): accept only amount > 0; return whether it was accepted.
//  - withdraw(amount): accept only 0 < amount <= balance; return whether it
//    succeeded. A rejected operation must not change the balance.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

class BankAccount {
 public:
  BankAccount() {
    // TODO: start the balance at 0.
  }

  explicit BankAccount(long long opening) {
    // TODO: start at opening, clamping a negative value to 0.
    (void)opening;
  }

  long long balance() const {
    // TODO: return the current balance.
    return 0;
  }

  bool deposit(long long amount) {
    // TODO: accept only amount > 0.
    (void)amount;
    return false;
  }

  bool withdraw(long long amount) {
    // TODO: accept only 0 < amount <= balance.
    (void)amount;
    return false;
  }

 private:
  // TODO: store the balance here as a private member.
};
