// Positive example for cpp.templates.function_templates.lesson.
// One definition works for many types; the compiler deduces T from the arguments
// and instantiates a concrete function per type used (here int, then double).
#include <iostream>

template <typename T>
T maxOf(T a, T b) {
    return a > b ? a : b;
}

int main() {
    std::cout << maxOf(3, 7) << "\n";
    std::cout << maxOf(2.5, 1.5) << "\n";
    return 0;
}
