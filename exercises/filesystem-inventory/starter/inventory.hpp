// Exercise: filesystem-inventory
// Summarize files below a root directory using std::filesystem.
//
// Rules:
//  - Missing roots and non-directory roots return an empty summary.
//  - Traverse root recursively.
//  - Count regular files and subdirectories below root.
//  - Sum regular-file sizes.
//  - Count file extensions, using "(none)" when path.extension() is empty.
//  - Use std::error_code for expected filesystem failures.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <cstdint>
#include <filesystem>
#include <map>
#include <string>

struct InventorySummary {
  int regular_files = 0;
  int directories = 0;
  std::uintmax_t total_bytes = 0;
  std::map<std::string, int> extension_counts;
};

inline InventorySummary summarize_directory(const std::filesystem::path& root) {
  // TODO: validate root, iterate recursively, and count file metadata.
  (void)root;
  return {};
}
