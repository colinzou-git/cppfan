// Positive example for cpp.values_types.literals.lesson.
// A literal's form sets its type, which drives how an expression evaluates:
// integer division truncates, and * binds tighter than +.
#include <iostream>

int main() {
    std::cout << 7 / 2 << "\n";       // 3: int / int truncates
    std::cout << 7 % 2 << "\n";       // 1: remainder
    std::cout << 7.0 / 2 << "\n";     // 3.5: a floating operand gives a real result
    std::cout << 2 + 3 * 4 << "\n";   // 14: * binds tighter than +
    std::cout << (2 + 3) * 4 << "\n"; // 20: parentheses change the grouping
    return 0;
}
