// Reference solution for getline-contact-parser.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <vector>

struct Contact {
  std::string name;
  std::string email;
  std::string phone;
  bool valid;
};

inline std::string trim(const std::string& s) {
  const std::string ws = " \t\r\n";
  const auto begin = s.find_first_not_of(ws);
  if (begin == std::string::npos) {
    return "";
  }
  const auto end = s.find_last_not_of(ws);
  return s.substr(begin, end - begin + 1);
}

inline Contact parse_contact(const std::string& line) {
  Contact c{"", "", "", false};
  std::vector<std::string> fields;
  std::string current;
  for (char ch : line) {
    if (ch == ',') {
      fields.push_back(trim(current));
      current.clear();
    } else {
      current.push_back(ch);
    }
  }
  fields.push_back(trim(current));

  if (fields.size() != 3) {
    return c;
  }
  c.name = fields[0];
  c.email = fields[1];
  c.phone = fields[2];
  c.valid = !c.name.empty() && !c.email.empty() && !c.phone.empty() &&
            c.email.find('@') != std::string::npos;
  return c;
}
