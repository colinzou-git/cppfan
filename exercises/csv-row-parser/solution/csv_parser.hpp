// Reference solution for csv-row-parser.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <vector>

// Split one CSV row into fields. Fields are comma-separated. A field may be
// wrapped in double quotes, in which case commas are literal and "" is an
// escaped double quote. A quote only opens a quoted field at the field start.
inline std::vector<std::string> parse_csv_row(const std::string& line) {
  std::vector<std::string> fields;
  std::string field;
  bool in_quotes = false;
  bool field_started = false;

  for (std::size_t i = 0; i < line.size(); ++i) {
    const char c = line[i];
    if (in_quotes) {
      if (c == '"') {
        if (i + 1 < line.size() && line[i + 1] == '"') {
          field.push_back('"');
          ++i;
        } else {
          in_quotes = false;
        }
      } else {
        field.push_back(c);
      }
    } else if (c == '"' && !field_started) {
      in_quotes = true;
      field_started = true;
    } else if (c == ',') {
      fields.push_back(field);
      field.clear();
      field_started = false;
    } else {
      field.push_back(c);
      field_started = true;
    }
  }
  fields.push_back(field);
  return fields;
}
