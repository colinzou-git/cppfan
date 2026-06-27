#pragma once
#include <string>
class StudentRecord { std::string name_; int id_; double gpa_; static double clampGpa(double g){ return g < 0.0 ? 0.0 : (g > 4.0 ? 4.0 : g); } public: StudentRecord(std::string name, int id, double gpa) : name_(name.empty() ? "unknown" : std::move(name)), id_(id < 0 ? 0 : id), gpa_(clampGpa(gpa)) {} const std::string& name() const { return name_; } int id() const { return id_; } double gpa() const { return gpa_; } };
