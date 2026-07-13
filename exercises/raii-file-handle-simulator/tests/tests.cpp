// Tests for raii-file-handle-simulator. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "file_handle.hpp"

static void test_open_on_construct() {
  const int base = FileHandle::open_count();
  FileHandle h("data.txt");
  CHECK(h.is_open());
  CHECK(h.name() == "data.txt");
  CHECK(FileHandle::open_count() == base + 1);
}

static void test_scope_cleanup() {
  const int base = FileHandle::open_count();
  {
    FileHandle a("a");
    FileHandle b("b");
    CHECK(FileHandle::open_count() == base + 2);
  }
  CHECK(FileHandle::open_count() == base);  // both closed at scope exit
}

static void test_explicit_close() {
  const int base = FileHandle::open_count();
  FileHandle h("x");
  h.close();
  CHECK(!h.is_open());
  CHECK(FileHandle::open_count() == base);
}

static void test_close_is_idempotent() {
  const int base = FileHandle::open_count();
  FileHandle h("y");
  h.close();
  h.close();  // must not decrement twice
  CHECK(FileHandle::open_count() == base);
}

int main() {
  test_open_on_construct();
  test_scope_cleanup();
  test_explicit_close();
  test_close_is_idempotent();
  return REPORT();
}
