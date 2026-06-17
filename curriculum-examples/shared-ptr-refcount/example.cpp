// Positive example for cpp.smart_pointers.shared_ptr.lesson.
// shared_ptr shares one object via a reference count: each new owner raises the
// count, each destroyed owner lowers it, and the object is freed at zero.
#include <iostream>
#include <memory>

int main() {
    auto p = std::make_shared<int>(7);
    std::cout << *p << " " << p.use_count() << "\n"; // 7 1
    {
        auto q = p; // shared ownership
        std::cout << p.use_count() << "\n"; // 2
    } // q destroyed here, count drops
    std::cout << p.use_count() << "\n"; // 1
    return 0;
}
