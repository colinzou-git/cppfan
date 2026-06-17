// Positive example for cpp.functions.basics.lesson.
// A function takes parameters that are copies of the arguments by default, so
// modifying a parameter does not affect the caller's variable.
#include <iostream>

int add(int a, int b) {
    return a + b;
}

void tryToChange(int x) {
    x = 99; // changes the local copy only
    std::cout << "inside: " << x << "\n"; // 99
}

int main() {
    std::cout << add(2, 3) << "\n"; // 5

    int n = 10;
    tryToChange(n);
    std::cout << n << "\n"; // 10: the caller's value is unchanged
    return 0;
}
