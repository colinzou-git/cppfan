// Positive example for cpp.stl.lambdas.lesson.
// A lambda is an inline anonymous function; here one serves as a comparator for
// std::sort and another (capturing a local) as a predicate for std::find_if.
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 2, 8, 1, 9, 3};

    std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; }); // descending
    for (int x : v) {
        std::cout << x << " "; // 9 8 5 3 2 1
    }
    std::cout << "\n";

    int threshold = 4;
    auto it = std::find_if(v.begin(), v.end(),
                           [threshold](int x) { return x < threshold; });
    std::cout << "first below " << threshold << ": " << *it << "\n"; // 3
    return 0;
}
