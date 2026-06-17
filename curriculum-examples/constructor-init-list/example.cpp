// Positive example for cpp.constructors.member_initializer_list.lesson.
// A member initializer list direct-initializes each member once, and is required
// for a const member (which cannot be assigned in the constructor body).
#include <iostream>

class Circle {
public:
    Circle(double r) : radius_(r), area_(3.14 * r * r) {} // initializer list
    double radius() const { return radius_; }
    double area() const { return area_; }

private:
    const double radius_; // const member: must be set in the initializer list
    double area_;
};

int main() {
    Circle c(2.0);
    std::cout << c.radius() << "\n"; // 2
    std::cout << c.area() << "\n";   // 12.56
    return 0;
}
