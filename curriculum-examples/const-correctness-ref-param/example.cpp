// Positive example for cpp.references.const_correctness.lesson.
// A const T& parameter reads a value without copying and promises not to modify
// it; a const member function can be called on a const object/reference.
#include <iostream>
#include <string>

std::size_t lengthOf(const std::string& s) { // reads without copying
    return s.size();
}

struct Counter {
    int value = 0;
    int get() const { return value; } // const: does not modify the object
    void add(int n) { value += n; }
};

int main() {
    std::string msg = "hello";
    std::cout << lengthOf(msg) << "\n"; // 5

    Counter c;
    c.add(3);
    c.add(4);
    const Counter& ref = c;
    std::cout << ref.get() << "\n"; // 7: const member callable through a const ref
    return 0;
}
