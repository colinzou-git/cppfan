// Positive example for cpp.smart_pointers.unique_ptr.lesson.
// unique_ptr models unique ownership: make_unique creates the owner, it cannot be
// copied, and std::move transfers ownership — leaving the moved-from pointer null.
#include <iostream>
#include <memory>

int main() {
    auto p = std::make_unique<int>(5);
    std::cout << *p << "\n";              // 5
    auto q = std::move(p);                // ownership transferred to q
    std::cout << (p == nullptr) << "\n";  // 1: p no longer owns anything
    std::cout << *q << "\n";              // 5
    return 0;
}
