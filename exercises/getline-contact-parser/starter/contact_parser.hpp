// Exercise: getline-contact-parser
// Parse one line of the form "Name, email, phone" into a Contact.
//
// Rules:
//  - Split the line on commas into exactly three fields.
//  - Trim leading/trailing whitespace from each field.
//  - The contact is `valid` only when all three fields are non-empty AND the
//    email field contains an '@'.
//  - If there are not exactly three comma-separated fields, return an invalid
//    contact (valid == false); the individual fields do not matter in that case.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

struct Contact {
  std::string name;
  std::string email;
  std::string phone;
  bool valid;
};

inline Contact parse_contact(const std::string& line) {
  // TODO: split on ',', trim each field, then validate.
  (void)line;
  return Contact{"", "", "", false};
}
