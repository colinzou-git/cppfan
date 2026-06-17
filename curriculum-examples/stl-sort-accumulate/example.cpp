// Positive example for cpp.stl.algorithms.lesson.
// Standard algorithms take iterator ranges: std::sort orders in place and
// std::accumulate sums the range — tested and expressive versus a hand loop.
#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v{4, 1, 3, 2};
    std::sort(v.begin(), v.end());
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    std::cout << std::accumulate(v.begin(), v.end(), 0) << "\n";
    return 0;
}
