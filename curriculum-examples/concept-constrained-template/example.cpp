// Positive example for cpp.templates.concepts.lesson.
// A concept (C++20) constrains a template parameter to types that meet stated
// requirements: std::integral accepts only integer types, making intent explicit
// and errors clearer than an unconstrained template.
#include <concepts>
#include <iostream>

template <std::integral T>
T twice(T x) {
    return x + x;
}

int main() {
    std::cout << twice(21) << "\n";
    return 0;
}
