// Tests for class-bank-account. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "bank_account.hpp"

static void test_starts_empty() {
  BankAccount a;
  CHECK(a.balance() == 0);
}

static void test_opening_balance() {
  BankAccount a(100);
  CHECK(a.balance() == 100);
}

static void test_negative_opening_clamps_to_zero() {
  BankAccount a(-50);
  CHECK(a.balance() == 0);
}

static void test_deposit_increases_balance() {
  BankAccount a;
  CHECK(a.deposit(40));
  CHECK(a.balance() == 40);
}

static void test_rejects_non_positive_deposit() {
  BankAccount a(10);
  CHECK(!a.deposit(0));
  CHECK(!a.deposit(-5));
  CHECK(a.balance() == 10);
}

static void test_withdraw_succeeds_within_balance() {
  BankAccount a(100);
  CHECK(a.withdraw(30));
  CHECK(a.balance() == 70);
}

static void test_rejects_overdraft() {
  BankAccount a(50);
  CHECK(!a.withdraw(51));
  CHECK(!a.withdraw(0));
  CHECK(a.balance() == 50);
}

int main() {
  test_starts_empty();
  test_opening_balance();
  test_negative_opening_clamps_to_zero();
  test_deposit_increases_balance();
  test_rejects_non_positive_deposit();
  test_withdraw_succeeds_within_balance();
  test_rejects_overdraft();
  return REPORT();
}
