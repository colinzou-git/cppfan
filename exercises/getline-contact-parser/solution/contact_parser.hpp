#pragma once

#include <cctype>
#include <string>
#include <vector>

struct Contact {
  std::string name;
  std::string email;
  std::string phone;
};

inline std::string trimContactField(std::string s) {
  std::size_t first = 0;
  while (first < s.size() && std::isspace(static_cast<unsigned char>(s[first]))) {
    ++first;
  }

  std::size_t last = s.size();
  while (last > first && std::isspace(static_cast<unsigned char>(s[last - 1]))) {
    --last;
  }

  return s.substr(first, last - first);
}

inline bool parseContactLine(const std::string& line, Contact& out) {
  std::vector<std::string> fields;
  std::string current;

  for (char ch : line) {
    if (ch == ',') {
      fields.push_back(trimContactField(current));
      current.clear();
    } else {
      current.push_back(ch);
    }
  }
  fields.push_back(trimContactField(current));

  if (fields.size() != 3) {
    return false;
  }
  if (fields[0].empty() || fields[1].empty() || fields[2].empty()) {
    return false;
  }

  out.name = fields[0];
  out.email = fields[1];
  out.phone = fields[2];
  return true;
}
