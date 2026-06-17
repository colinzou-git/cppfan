// Positive example for cpp.values_types.variables.lesson.
// A variable has a type and a name and should be initialized on declaration;
// auto deduces the type, const marks an unchangeable value, constexpr a
// compile-time constant.
#include <iostream>

int main() {
    int count = 0;           // initialized on declaration
    auto n = 7;              // auto deduces int from the initializer
    const double pi = 3.14;  // must not change
    constexpr int max = 100; // compile-time constant

    count = n + max;
    std::cout << count << "\n"; // 107
    std::cout << pi << "\n";    // 3.14
    return 0;
}
