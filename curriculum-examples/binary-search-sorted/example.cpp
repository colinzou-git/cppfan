// Positive example for dsa.searching.binary_search.lesson.
// Binary search needs sorted input: std::binary_search returns whether a value
// is present, and std::lower_bound returns the first position not less than it.
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 3, 5, 7, 9, 11}; // must be sorted

    std::cout << (std::binary_search(v.begin(), v.end(), 7) ? "found" : "missing") << "\n";  // found
    std::cout << (std::binary_search(v.begin(), v.end(), 8) ? "found" : "missing") << "\n";  // missing

    auto it = std::lower_bound(v.begin(), v.end(), 6); // first element >= 6
    std::cout << *it << "\n";              // 7
    std::cout << (it - v.begin()) << "\n"; // 3: its index
    return 0;
}
