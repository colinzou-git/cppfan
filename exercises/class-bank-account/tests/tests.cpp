#include "check.hpp"
#include "bank_account.hpp"
void test_negative_initial_becomes_zero(){ BankAccount a(-5); CHECK(a.balance_cents()==0);}
void test_deposit_and_withdraw(){ BankAccount a(100); CHECK(a.deposit(50)); CHECK(a.withdraw(70)); CHECK(a.balance_cents()==80);}
void test_rejects_negative_deposit(){ BankAccount a(10); CHECK(!a.deposit(-1)); CHECK(a.balance_cents()==10);}
void test_rejects_overdraft(){ BankAccount a(10); CHECK(!a.withdraw(11)); CHECK(a.balance_cents()==10);}
void test_const_getter(){ const BankAccount a(12); CHECK(a.balance_cents()==12);}
int main(){ test_negative_initial_becomes_zero(); test_deposit_and_withdraw(); test_rejects_negative_deposit(); test_rejects_overdraft(); test_const_getter(); return REPORT();}
