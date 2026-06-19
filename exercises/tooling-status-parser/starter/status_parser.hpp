#pragma once

#include <string>
#include <string_view>

struct ParseResult {
  bool ok;
  int code;
  std::string message;
};

inline ParseResult parse_status_line(std::string_view line) {
  (void)line;
  return {true, 0, ""};
}
