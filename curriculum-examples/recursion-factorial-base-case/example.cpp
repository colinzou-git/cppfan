// Positive example for dsa.recursion.base_case.lesson.
// A recursive function needs a base case that stops it and a recursive case that
// moves strictly toward the base case. factorial(0) is 1; otherwise it recurses
// on n - 1, shrinking toward 0.
#include <iostream>

long long factorial(int n) {
    if (n == 0) return 1;        // base case
    return n * factorial(n - 1); // recursive case moves toward 0
}

int main() {
    std::cout << factorial(0) << "\n"; // 1
    std::cout << factorial(5) << "\n"; // 120
    return 0;
}
