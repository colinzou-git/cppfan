// Positive example for cpp.references.lvalue_rvalue.lesson.
// Lvalues name persistent, addressable objects; rvalues are temporaries.
// Overload resolution routes an lvalue to const int& and a temporary to int&&,
// and a const lvalue reference can bind to (and extend) a temporary.
#include <iostream>
#include <utility>

void classify(const int&) { std::cout << "lvalue\n"; }
void classify(int&&) { std::cout << "rvalue\n"; }

int main() {
    int x = 5;
    classify(x);            // lvalue
    classify(42);           // rvalue (a literal temporary)
    classify(x + 1);        // rvalue (result of an expression)
    classify(std::move(x)); // rvalue (cast to rvalue)

    const int& r = 42; // const lvalue ref binds to a temporary
    std::cout << r << "\n"; // 42
    return 0;
}
