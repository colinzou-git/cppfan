// Positive example for cpp.value_semantics.operators.lesson.
// A C++20 defaulted operator<=> generates the ordering operators consistently
// (and a defaulted operator== gives equality); a single-argument constructor is
// marked explicit to avoid a surprising implicit conversion.
#include <compare>
#include <iostream>

struct Money {
    int cents;
    explicit Money(int c) : cents(c) {}             // no implicit int -> Money
    auto operator<=>(const Money&) const = default; // generates <, <=, >, >=
    bool operator==(const Money&) const = default;  // equality
};

int main() {
    Money a{150};
    Money b{200};

    std::cout << (a == a ? "equal" : "not") << "\n"; // equal
    std::cout << (a < b ? "a<b" : "a>=b") << "\n";   // a<b
    std::cout << (b >= a ? "yes" : "no") << "\n";    // yes
    return 0;
}
