// Positive example for cpp.references.pointer_const.lesson.
// Read const around the *: const int* is a pointer to const (repoint OK, data
// locked); int* const is a const pointer (data writable, pointer fixed).
#include <iostream>

int main() {
    int a = 1;
    int b = 2;

    const int* ptrToConst = &a; // pointer to const
    ptrToConst = &b;            // OK: the pointer itself can move
    std::cout << *ptrToConst << "\n"; // 2 (cannot modify *ptrToConst)

    int* const constPtr = &a; // const pointer
    *constPtr = 9;            // OK: the pointed-to data is writable
    std::cout << a << "\n";    // 9 (constPtr cannot be repointed)
    return 0;
}
