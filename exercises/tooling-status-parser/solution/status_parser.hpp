#pragma once

#include <sstream>
#include <string>
#include <string_view>

struct ParseResult {
  bool ok;
  int code;
  std::string message;
};

inline ParseResult parse_status_line(std::string_view line) {
  std::istringstream in{std::string(line)};
  std::string status;
  int code = -1;

  if (!(in >> status >> code)) {
    return {false, -1, "malformed"};
  }
  if (status != "OK" && status != "ERR") {
    return {false, -1, "malformed"};
  }
  if (code < 0) {
    return {false, -1, "invalid code"};
  }

  std::string message;
  std::getline(in, message);
  if (!message.empty() && message.front() == ' ') {
    message.erase(0, 1);
  }
  if (message.empty()) {
    return {false, -1, "malformed"};
  }

  return {true, code, message};
}
