// Positive example for cpp.functions.decomposition.lesson.
// Break a task into small, well-named functions that each do one thing; compose
// them to solve the larger problem (easier to read, test, and reuse).
#include <iostream>

bool isEven(int n) { return n % 2 == 0; }

int square(int n) { return n * n; }

int sumOfEvenSquares(int lo, int hi) {
    int total = 0;
    for (int n = lo; n <= hi; ++n) {
        if (isEven(n)) total += square(n);
    }
    return total;
}

int main() {
    std::cout << sumOfEvenSquares(1, 6) << "\n"; // 4 + 16 + 36 = 56
    std::cout << sumOfEvenSquares(2, 4) << "\n"; // 4 + 16 = 20
    return 0;
}
