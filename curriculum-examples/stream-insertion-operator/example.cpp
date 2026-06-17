// Positive example for cpp.value_semantics.stream_insertion.lesson.
// Make a type printable with std::cout by overloading operator<< as a NON-member:
// the left operand is the stream, so take std::ostream& and the value by const&,
// write the fields, and return the stream so calls chain.
#include <iostream>

struct Point {
    int x;
    int y;
};

std::ostream& operator<<(std::ostream& os, const Point& p) {
    os << "(" << p.x << ", " << p.y << ")";
    return os;
}

int main() {
    Point p{3, 4};
    std::cout << p << "\n";
    return 0;
}
