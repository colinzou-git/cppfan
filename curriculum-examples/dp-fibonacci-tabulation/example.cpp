// Positive example for dsa.techniques.dynamic_programming.lesson.
// Bottom-up tabulation fills a table in dependency order, computing each
// overlapping subproblem once — turning exponential naive Fibonacci into O(n).
#include <iostream>
#include <vector>

int main() {
    const int n = 10;
    std::vector<long long> fib(n + 1);
    fib[0] = 0;
    fib[1] = 1;
    for (int i = 2; i <= n; ++i) {
        fib[i] = fib[i - 1] + fib[i - 2]; // reuse already-computed subproblems
    }

    std::cout << fib[n] << "\n"; // 55
    std::cout << fib[7] << "\n"; // 13
    return 0;
}
