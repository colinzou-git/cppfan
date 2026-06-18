// Positive example for cpp.structs_classes.invariants_intro.lesson.
// A class invariant is a rule that holds after construction and after every
// public method. Here a Percentage is always in [0, 100]: the constructor
// establishes it and set() preserves it, and the field is private to enforce it.
#include <iostream>

class Percentage {
public:
    explicit Percentage(int v) { set(v); } // constructor establishes the invariant
    void set(int v) {
        value_ = v < 0 ? 0 : (v > 100 ? 100 : v); // clamp to [0, 100]
    }
    int value() const { return value_; }

private:
    int value_ = 0; // invariant: always 0..100
};

int main() {
    Percentage a(150);
    std::cout << a.value() << "\n"; // 100 (clamped)

    Percentage b(-20);
    std::cout << b.value() << "\n"; // 0 (clamped)

    Percentage c(57);
    c.set(200);
    std::cout << c.value() << "\n"; // 100 (invariant preserved)
    return 0;
}
