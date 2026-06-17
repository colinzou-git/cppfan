// Positive example for cpp.references.references.lesson.
// A reference (T&) is another name for an existing object; a reference parameter
// lets a function modify the caller's variable in place without copying it.
#include <iostream>

void inc(int& n) { ++n; } // modifies the caller's variable

int main() {
    int x = 5;
    int& alias = x; // alias is another name for x
    alias = 8;
    std::cout << x << "\n"; // 8: alias and x are the same object

    inc(x);
    std::cout << x << "\n"; // 9: changed in place through the reference
    return 0;
}
