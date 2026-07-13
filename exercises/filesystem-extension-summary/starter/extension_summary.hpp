// Exercise: filesystem-extension-summary
// Summarize how many file names carry each extension.
//
// Rules:
//  - Use std::filesystem::path to read each name's extension (pure parsing — do
//    not touch the real disk).
//  - Group names with no extension (including dotfiles like ".gitignore") under
//    the key "(none)".
//  - Return a std::map<std::string, int> from extension (e.g. ".txt") to count.
//  - "archive.tar.gz" has extension ".gz" (only the last one).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <filesystem>
#include <map>
#include <string>
#include <vector>

inline std::map<std::string, int> extension_counts(const std::vector<std::string>& filenames) {
  // TODO: for each name, read path.extension(); tally into the map ("(none)"
  // when empty).
  (void)filenames;
  return {};
}
