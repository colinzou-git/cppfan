// Positive example for cpp.references.return_semantics.lesson.
// Return by value is the safe default. Return a reference only to storage that
// outlives the call: a member of *this, or a container element via operator[].
#include <iostream>
#include <vector>

struct Counter {
    int value = 0;
    int& ref() { return value; } // safe: a reference to a member of *this
};

int doubled(int n) { return n * 2; } // return by value

int main() {
    std::cout << doubled(21) << "\n"; // 42

    Counter c;
    c.ref() = 7; // write through the returned reference
    c.ref() += 3;
    std::cout << c.value << "\n"; // 10

    std::vector<int> v = {1, 2, 3};
    v[1] = 20; // operator[] returns a reference into the container
    std::cout << v[1] << "\n"; // 20
    return 0;
}
