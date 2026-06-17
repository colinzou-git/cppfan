// Positive example for cpp.stl.vector.lesson.
// std::vector is a resizable array that owns its elements: push_back appends,
// size() counts, v[i] accesses without a bounds check, and at(i) checks bounds.
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    v.push_back(10);
    v.push_back(20);
    v.push_back(30);

    std::cout << v.size() << "\n"; // 3
    std::cout << v[1] << "\n";     // 20: unchecked access
    std::cout << v.at(2) << "\n";  // 30: bounds-checked access

    int sum = 0;
    for (int x : v) sum += x;
    std::cout << sum << "\n"; // 60
    return 0;
}
