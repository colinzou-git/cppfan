// Positive example for cpp.utilities.enums.lesson.
// A scoped enum (enum class) models a closed set of named states: names are
// scoped, there is no implicit int conversion, and a switch can be exhaustive.
#include <iostream>

enum class Status { Pending, Active, Closed };

const char* label(Status s) {
    switch (s) {
        case Status::Pending: return "pending";
        case Status::Active:  return "active";
        case Status::Closed:  return "closed";
    }
    return "unknown";
}

int main() {
    Status s = Status::Active;
    std::cout << label(s) << "\n"; // active

    s = Status::Closed;
    std::cout << label(s) << "\n"; // closed
    std::cout << (s == Status::Closed ? "is closed" : "not closed") << "\n"; // is closed
    return 0;
}
