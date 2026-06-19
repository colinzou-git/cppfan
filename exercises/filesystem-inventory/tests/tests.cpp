// Tests for filesystem-inventory. Build with -I _harness and the implementation dir.
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <string>

#include "check.hpp"
#include "inventory.hpp"

namespace fs = std::filesystem;

static fs::path make_root(const std::string& name) {
  fs::path root = fs::temp_directory_path() / ("cppfan-" + name);
  std::error_code ec;
  fs::remove_all(root, ec);
  fs::create_directories(root, ec);
  return root;
}

static void write_file(const fs::path& path, const std::string& contents) {
  std::ofstream out(path, std::ios::binary);
  out << contents;
}

static void cleanup(const fs::path& root) {
  std::error_code ec;
  fs::remove_all(root, ec);
}

static int extension_count(const InventorySummary& summary, const std::string& extension) {
  auto it = summary.extension_counts.find(extension);
  return it == summary.extension_counts.end() ? 0 : it->second;
}

static void test_missing_root_is_empty() {
  const fs::path missing = fs::temp_directory_path() / "cppfan-missing-root-never-created";
  std::error_code ec;
  fs::remove_all(missing, ec);

  const InventorySummary summary = summarize_directory(missing);
  CHECK(summary.regular_files == 0);
  CHECK(summary.directories == 0);
  CHECK(summary.total_bytes == 0);
  CHECK(summary.extension_counts.empty());
}

static void test_rejects_plain_file_root() {
  const fs::path root = make_root("inventory-file-root");
  const fs::path file = root / "plain.txt";
  write_file(file, "abc");

  const InventorySummary summary = summarize_directory(file);
  CHECK(summary.regular_files == 0);
  CHECK(summary.directories == 0);
  CHECK(summary.total_bytes == 0);
  cleanup(root);
}

static void test_counts_nested_files_and_directories() {
  const fs::path root = make_root("inventory-nested");
  fs::create_directories(root / "logs");
  fs::create_directories(root / "data" / "raw");
  write_file(root / "logs" / "a.log", "hello");
  write_file(root / "data" / "raw" / "b.bin", "abcd");

  const InventorySummary summary = summarize_directory(root);
  CHECK(summary.regular_files == 2);
  CHECK(summary.directories == 3);
  CHECK(summary.total_bytes == 9);
  cleanup(root);
}

static void test_counts_extensions_and_no_extension() {
  const fs::path root = make_root("inventory-extensions");
  write_file(root / "a.txt", "1");
  write_file(root / "b.txt", "22");
  write_file(root / "README", "333");

  const InventorySummary summary = summarize_directory(root);
  CHECK(extension_count(summary, ".txt") == 2);
  CHECK(extension_count(summary, "(none)") == 1);
  CHECK(summary.total_bytes == 6);
  cleanup(root);
}

static void test_empty_directory() {
  const fs::path root = make_root("inventory-empty");
  const InventorySummary summary = summarize_directory(root);
  CHECK(summary.regular_files == 0);
  CHECK(summary.directories == 0);
  CHECK(summary.total_bytes == 0);
  CHECK(summary.extension_counts.empty());
  cleanup(root);
}

int main() {
  test_missing_root_is_empty();
  test_rejects_plain_file_root();
  test_counts_nested_files_and_directories();
  test_counts_extensions_and_no_extension();
  test_empty_directory();
  return REPORT();
}
