// Positive example for cpp.stl.set.lesson.
// std::set stores unique elements in sorted order: a duplicate insert is
// ignored, contains() tests membership, and erase() removes an element.
#include <iostream>
#include <set>

int main() {
    std::set<int> s;
    s.insert(3);
    s.insert(1);
    s.insert(2);
    s.insert(1); // duplicate: ignored, set stays unique

    for (int x : s) {
        std::cout << x << " "; // sorted iteration: 1 2 3
    }
    std::cout << "\n";
    std::cout << "size " << s.size() << "\n"; // 3

    std::cout << (s.contains(2) ? "has 2" : "no 2") << "\n";
    s.erase(2);
    std::cout << (s.contains(2) ? "has 2" : "no 2") << "\n";
    return 0;
}
