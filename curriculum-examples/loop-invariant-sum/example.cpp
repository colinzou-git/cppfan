// Positive example for cpp.control_flow.loop_invariants.lesson.
// A half-open range [0, n) with the invariant "sum holds the total of the first i
// elements" gives correct bounds; continue skips one iteration and break exits.
#include <iostream>
#include <vector>

int main() {
    std::vector<int> a = {10, 20, 30, 40, 50};
    int n = static_cast<int>(a.size());

    int sum = 0;
    for (int i = 0; i < n; ++i) { // half-open [0, n)
        sum += a[i];              // invariant: sum = total of a[0..i)
    }
    std::cout << sum << "\n"; // 150

    int partial = 0;
    for (int x : a) {
        if (x == 40) continue; // skip this value
        if (x > 45) break;     // stop before 50
        partial += x;
    }
    std::cout << partial << "\n"; // 60 (10 + 20 + 30)
    return 0;
}
