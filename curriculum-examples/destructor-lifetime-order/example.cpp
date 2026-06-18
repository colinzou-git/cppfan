// Positive example for cpp.constructors.destructor_intro.lesson.
// A destructor runs automatically when an object's lifetime ends. Local (stack)
// objects are destroyed at the end of their scope in reverse construction order.
#include <iostream>
#include <string>
#include <utility>

struct Tracer {
    std::string name;
    explicit Tracer(std::string n) : name(std::move(n)) {
        std::cout << "construct " << name << "\n";
    }
    ~Tracer() { std::cout << "destruct " << name << "\n"; }
};

int main() {
    Tracer a("A");
    Tracer b("B");
    std::cout << "body\n";
    return 0;
} // b is destroyed before a (reverse order of construction)
