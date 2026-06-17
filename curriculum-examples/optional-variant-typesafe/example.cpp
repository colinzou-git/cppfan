// Positive example for cpp.utilities.variant.lesson.
// std::optional<T> models a maybe-present value (no sentinels); std::variant
// holds exactly one of several types and is read safely via visit / get_if.
#include <iostream>
#include <optional>
#include <string>
#include <variant>

std::optional<int> firstEven(int a, int b) {
    if (a % 2 == 0) return a;
    if (b % 2 == 0) return b;
    return std::nullopt;
}

int main() {
    auto found = firstEven(3, 4);
    std::cout << (found ? "even " : "none ") << found.value_or(-1) << "\n"; // even 4

    auto missing = firstEven(1, 3);
    std::cout << (missing ? "even" : "none") << "\n"; // none

    std::variant<int, std::string> v = std::string("hi");
    std::visit([](const auto& x) { std::cout << x << "\n"; }, v); // hi

    v = 42; // now the int alternative is active
    if (auto* p = std::get_if<int>(&v)) {
        std::cout << "int " << *p << "\n"; // int 42
    }
    return 0;
}
