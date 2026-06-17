// Positive example for cpp.control_flow.conditionals.lesson.
// if / else if / else picks one branch from a chain of bool conditions built
// with comparison operators.
#include <iostream>
#include <string>

std::string grade(int score) {
    if (score >= 90) {
        return "A";
    } else if (score >= 80) {
        return "B";
    } else if (score >= 70) {
        return "C";
    } else {
        return "F";
    }
}

int main() {
    std::cout << grade(95) << "\n"; // A
    std::cout << grade(83) << "\n"; // B
    std::cout << grade(71) << "\n"; // C
    std::cout << grade(40) << "\n"; // F
    return 0;
}
