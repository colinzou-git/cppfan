// Reference solution for constructors-student-record.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <utility>

class Student {
 public:
  Student() : name_(""), id_(0), gpa_(0.0) {}

  Student(std::string name, int id, double gpa)
      : name_(std::move(name)), id_(id < 0 ? 0 : id), gpa_(clamp_gpa(gpa)) {}

  const std::string& name() const { return name_; }
  int id() const { return id_; }
  double gpa() const { return gpa_; }
  bool is_honor_roll() const { return gpa_ >= 3.5; }

 private:
  static double clamp_gpa(double g) {
    if (g < 0.0) {
      return 0.0;
    }
    if (g > 4.0) {
      return 4.0;
    }
    return g;
  }

  std::string name_;
  int id_;
  double gpa_;
};
