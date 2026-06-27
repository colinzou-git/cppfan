#pragma once
#include <string>
class StudentRecord { public: StudentRecord(std::string name, int id, double gpa){ (void)name; (void)id; (void)gpa; } const std::string& name() const { static const std::string unknown = "unknown"; return unknown; } int id() const { return 0; } double gpa() const { return 0.0; } };
