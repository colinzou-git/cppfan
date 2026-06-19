// Positive example for dsa.techniques.prefix_sums.code_diff_trace.
// Difference arrays make each range update O(1), then a prefix pass rebuilds
// the final array.
#include <iostream>
#include <vector>

int main() {
    const int n = 5;
    std::vector<int> diff(n + 1, 0);

    auto addRange = [&](int left, int right, int value) {
        diff[left] += value;
        if (right + 1 < static_cast<int>(diff.size())) {
            diff[right + 1] -= value;
        }
    };

    addRange(1, 3, 3);
    addRange(2, 4, 2);

    int running = 0;
    for (int i = 0; i < n; ++i) {
        running += diff[i];
        if (i > 0) std::cout << " ";
        std::cout << running;
    }
    std::cout << "\n";
    return 0;
}
