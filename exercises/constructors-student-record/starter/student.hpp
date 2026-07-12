// Exercise: constructors-student-record
// Practice a default constructor and a parameterized constructor that uses a
// member initializer list and enforces simple validation.
//
// Rules:
//  - Student() default-constructs: name "", id 0, gpa 0.0.
//  - Student(name, id, gpa) initializes members via an initializer list:
//      * a negative id becomes 0;
//      * gpa is clamped into the range [0.0, 4.0].
//  - name(), id(), gpa() are const getters.
//  - is_honor_roll() is const and true when gpa >= 3.5.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <utility>

class Student {
 public:
  Student() {
    // TODO: default to "", 0, 0.0 (prefer an initializer list).
  }

  Student(std::string name, int id, double gpa) {
    // TODO: use a member initializer list; clamp id (>= 0) and gpa ([0, 4]).
    (void)name;
    (void)id;
    (void)gpa;
  }

  const std::string& name() const {
    static const std::string empty;
    return empty;  // TODO: return the stored name.
  }
  int id() const { return 0; }        // TODO
  double gpa() const { return 0.0; }  // TODO
  bool is_honor_roll() const { return false; }  // TODO: gpa >= 3.5

 private:
  // TODO: declare name_, id_, gpa_ members.
};
