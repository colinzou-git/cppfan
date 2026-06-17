// Positive example for cpp.oop.abstract_interfaces.lesson.
// A pure virtual function (= 0) makes Shape abstract — it cannot be instantiated.
// Concrete classes must override it, and code can depend on the abstraction.
#include <iostream>
#include <memory>
#include <vector>

struct Shape {
    virtual double area() const = 0; // pure virtual -> abstract interface
    virtual ~Shape() = default;
};

struct Square : Shape {
    double side;
    explicit Square(double s) : side(s) {}
    double area() const override { return side * side; }
};

struct Rectangle : Shape {
    double w, h;
    Rectangle(double w_, double h_) : w(w_), h(h_) {}
    double area() const override { return w * h; }
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Square>(3.0));
    shapes.push_back(std::make_unique<Rectangle>(2.0, 5.0));

    double total = 0;
    for (const auto& s : shapes) {
        std::cout << s->area() << "\n"; // 9 then 10 (resolved via the interface)
        total += s->area();
    }
    std::cout << total << "\n"; // 19
    return 0;
}
