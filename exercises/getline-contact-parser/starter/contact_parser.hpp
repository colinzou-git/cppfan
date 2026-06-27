#pragma once
#include <string>

struct Contact { std::string name; std::string email; std::string phone; };
inline bool parseContactLine(const std::string& line, Contact& out) { (void)line; (void)out; return false; }
