// Positive example for cpp.templates.if_constexpr.lesson.
// `if constexpr` chooses a branch at compile time and discards the other, so the
// `*v` branch is never instantiated for a non-pointer T. A plain runtime `if`
// would require both branches to compile for every T, making `*v` on an int an
// error. This compiles for both print(int) and print(int*).
#include <iostream>
#include <type_traits>

template <typename T>
void print(T v) {
    if constexpr (std::is_pointer_v<T>) {
        std::cout << *v << "\n";
    } else {
        std::cout << v << "\n";
    }
}

int main() {
    int x = 42;
    print(x);   // non-pointer branch
    print(&x);  // pointer branch -> dereferences
    return 0;
}
