// Positive example for cpp.value_semantics.move.lesson.
// Moving transfers ownership instead of copying: std::move hands off a
// unique_ptr, leaving the source valid but empty (a moved-from unique_ptr is
// guaranteed null).
#include <iostream>
#include <memory>
#include <utility>

int main() {
    auto a = std::make_unique<int>(42);
    std::cout << *a << "\n";                          // 42
    std::cout << (a ? "has value" : "empty") << "\n"; // has value

    auto b = std::move(a); // transfer ownership from a to b
    std::cout << *b << "\n";                          // 42: b now owns it
    std::cout << (a ? "has value" : "empty") << "\n"; // empty: a is null after the move
    return 0;
}
