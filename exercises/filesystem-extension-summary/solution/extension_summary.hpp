// Reference solution for filesystem-extension-summary.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <filesystem>
#include <map>
#include <string>
#include <vector>

// Count how many of the given file names carry each extension. Uses
// std::filesystem::path to extract the extension (pure string parsing, no disk
// access). Extensionless names (including dotfiles like ".gitignore") are
// grouped under "(none)". The returned map is naturally sorted by key.
inline std::map<std::string, int> extension_counts(const std::vector<std::string>& filenames) {
  std::map<std::string, int> counts;
  for (const std::string& name : filenames) {
    const std::filesystem::path path(name);
    std::string ext = path.extension().string();
    if (ext.empty()) {
      ext = "(none)";
    }
    ++counts[ext];
  }
  return counts;
}
