// Positive example for cpp.raii.resource_lifetime.lesson.
// Acquire in the constructor, release in the destructor: the resource's lifetime
// is tied to the object's, so leaving a scope releases it automatically — in
// reverse (LIFO) construction order.
#include <iostream>

struct Guard {
    const char* name;
    explicit Guard(const char* n) : name(n) { std::cout << "acquire " << name << "\n"; }
    ~Guard() { std::cout << "release " << name << "\n"; }
};

int main() {
    Guard outer{"outer"};
    {
        Guard inner{"inner"};
        std::cout << "work\n";
    } // inner's destructor runs here
    std::cout << "after inner\n";
    return 0;
} // outer's destructor runs here
