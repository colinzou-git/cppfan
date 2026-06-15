// Positive example for cpp.values_types.conversions.lesson.
// Without the cast, 7 / 2 would be integer division (3). Casting one operand to
// double makes the whole expression use floating-point division.
#include <iostream>

int main() {
    int a = 7;
    int b = 2;
    double result = static_cast<double>(a) / b;
    std::cout << a << " / " << b << " as double = " << result << "\n";
    return 0;
}
