// Reference solution for filesystem-inventory.
// Kept out of the learner-facing default path; do not reveal before completion.
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
  namespace fs = std::filesystem;

  InventorySummary summary;
  std::error_code ec;
  if (!fs::exists(root, ec) || ec) {
    return summary;
  }
  if (!fs::is_directory(root, ec) || ec) {
    return summary;
  }

  fs::recursive_directory_iterator it(root, fs::directory_options::skip_permission_denied, ec);
  const fs::recursive_directory_iterator end;
  while (!ec && it != end) {
    const fs::directory_entry& entry = *it;
    if (entry.is_directory(ec)) {
      if (!ec) {
        ++summary.directories;
      }
    } else if (!ec && entry.is_regular_file(ec)) {
      if (!ec) {
        ++summary.regular_files;
        const auto size = entry.file_size(ec);
        if (!ec) {
          summary.total_bytes += size;
        } else {
          ec.clear();
        }

        std::string ext = entry.path().extension().string();
        if (ext.empty()) {
          ext = "(none)";
        }
        ++summary.extension_counts[ext];
      }
    }

    it.increment(ec);
    if (ec) {
      ec.clear();
    }
  }

  return summary;
}
