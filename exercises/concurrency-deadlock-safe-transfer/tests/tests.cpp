#include "check.hpp"
#include "safe_transfer.hpp"
#include <thread>
#include <vector>

static void test_basic_transfer() {
  TransferAccount a(80), b(20);
  CHECK(transfer_funds(a, b, 30));
  CHECK(a.balance == 50);
  CHECK(b.balance == 50);
}
static void test_insufficient_funds() {
  TransferAccount a(1), b(9);
  CHECK(!transfer_funds(a, b, 2));
  CHECK(a.balance == 1);
  CHECK(b.balance == 9);
}
static void test_self_transfer() {
  TransferAccount a(17);
  CHECK(transfer_funds(a, a, 100));
  CHECK(a.balance == 17);
  CHECK(!transfer_funds(a, a, -1));
}
static void test_negative_rejected() {
  TransferAccount a(10), b(10);
  CHECK(!transfer_funds(a, b, -1));
  CHECK(a.balance + b.balance == 20);
}
static void test_opposite_direction_workers() {
  TransferAccount a(10000), b(10000);
  std::thread first([&] { for (int i = 0; i < 2500; ++i) CHECK(transfer_funds(a, b, 1)); });
  std::thread second([&] { for (int i = 0; i < 2500; ++i) CHECK(transfer_funds(b, a, 1)); });
  first.join();
  second.join();
  CHECK(a.balance + b.balance == 20000);
  CHECK(a.balance == 10000);
  CHECK(b.balance == 10000);
}
int main() {
  test_basic_transfer();
  test_insufficient_funds();
  test_self_transfer();
  test_negative_rejected();
  test_opposite_direction_workers();
  return REPORT();
}
