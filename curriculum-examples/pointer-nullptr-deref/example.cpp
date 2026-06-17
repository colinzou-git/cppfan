// Positive example for cpp.references.pointers.lesson.
// A pointer (T*) stores the address of an object or nullptr; &x takes an address,
// *p dereferences, and unlike a reference a pointer can be reassigned or null.
#include <iostream>

int main() {
    int a = 10;
    int b = 20;

    int* p = &a; // p holds the address of a
    std::cout << *p << "\n"; // 10: dereference reaches the object

    p = &b; // a pointer can be repointed
    std::cout << *p << "\n"; // 20

    p = nullptr; // "points to nothing"
    std::cout << (p == nullptr ? "null" : "not null") << "\n"; // null
    return 0;
}
