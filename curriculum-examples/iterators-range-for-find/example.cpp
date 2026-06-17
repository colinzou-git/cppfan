// Positive example for cpp.stl.iterators.lesson.
// A range is the half-open interval [begin, end); range-based for walks every
// element, and search functions return end() to mean "not found".
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{10, 20, 30};

    int sum = 0;
    for (const auto& x : v) {
        sum += x;
    }
    std::cout << sum << "\n"; // 60

    auto found = std::find(v.begin(), v.end(), 20);
    std::cout << (found != v.end() ? "found" : "missing") << "\n";

    auto absent = std::find(v.begin(), v.end(), 99);
    std::cout << (absent == v.end() ? "missing" : "found") << "\n";
    return 0;
}
