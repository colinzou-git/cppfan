// Positive example for cpp.constructors.default_constructor.lesson.
// Declaring any constructor suppresses the implicit default one; add it back with
// `= default` if no-argument construction should still be allowed.
#include <iostream>

class Widget {
public:
    Widget() = default;                  // keep the no-arg constructor
    explicit Widget(int n) : count_(n) {} // a parameterized constructor

    int count() const { return count_; }

private:
    int count_ = 0;
};

int main() {
    Widget a;    // default constructor
    Widget b(5); // parameterized constructor
    std::cout << a.count() << "\n"; // 0
    std::cout << b.count() << "\n"; // 5
    return 0;
}
