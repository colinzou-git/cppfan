// Positive example for cpp.structs_classes.syntax.lesson.
// A struct groups related data (member fields) and behavior (member functions)
// into one type; each object (instance) has its own copy of the fields.
#include <iostream>

struct Point {
    int x;
    int y;
    int manhattan() const { return (x < 0 ? -x : x) + (y < 0 ? -y : y); }
};

int main() {
    Point a{3, 4};
    Point b{-1, 2};

    std::cout << a.x << "," << a.y << "\n"; // 3,4
    std::cout << a.manhattan() << "\n";     // 7
    std::cout << b.manhattan() << "\n";     // 3
    return 0;
}
