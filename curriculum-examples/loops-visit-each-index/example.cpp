// Positive example for cpp.control_flow.loops.lesson.
// for (int i = 0; i < n; ++i) visits each index 0..n-1 exactly once; `i <= n`
// would overrun by one. Here n == v.size(), so every element is printed once.
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3};
    int n = static_cast<int>(v.size());
    for (int i = 0; i < n; ++i) {
        std::cout << i << ":" << v[i] << "\n";
    }
    return 0;
}
