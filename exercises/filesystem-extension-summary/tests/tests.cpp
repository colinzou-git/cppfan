// Tests for filesystem-extension-summary. Build with -I _harness and impl dir.
#include <map>
#include <string>
#include <vector>

#include "check.hpp"
#include "extension_summary.hpp"

using M = std::map<std::string, int>;

static void test_basic_counts() {
  M got = extension_counts({"a.txt", "b.txt", "c.md", "photo.png"});
  M expected{{".txt", 2}, {".md", 1}, {".png", 1}};
  CHECK(got == expected);
}

static void test_no_extension_and_dotfiles() {
  M got = extension_counts({"README", "Makefile", ".gitignore"});
  M expected{{"(none)", 3}};
  CHECK(got == expected);
}

static void test_multi_dot_takes_last() {
  M got = extension_counts({"archive.tar.gz", "backup.tar.gz"});
  M expected{{".gz", 2}};
  CHECK(got == expected);
}

static void test_case_preserved() {
  M got = extension_counts({"a.PNG", "b.png"});
  M expected{{".PNG", 1}, {".png", 1}};
  CHECK(got == expected);
}

static void test_paths_with_directories() {
  M got = extension_counts({"src/main.cpp", "include/util.hpp"});
  M expected{{".cpp", 1}, {".hpp", 1}};
  CHECK(got == expected);
}

static void test_empty() {
  CHECK(extension_counts({}).empty());
}

int main() {
  test_basic_counts();
  test_no_extension_and_dotfiles();
  test_multi_dot_takes_last();
  test_case_preserved();
  test_paths_with_directories();
  test_empty();
  return REPORT();
}
