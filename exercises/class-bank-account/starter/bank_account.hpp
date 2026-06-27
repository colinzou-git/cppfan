#pragma once
class BankAccount { public: explicit BankAccount(long long initial_cents) { (void)initial_cents; } bool deposit(long long cents){ (void)cents; return false; } bool withdraw(long long cents){ (void)cents; return false; } long long balance_cents() const { return 0; } };
