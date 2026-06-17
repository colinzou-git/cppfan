// Positive example for cpp.oop.virtual_polymorphism.lesson.
// A virtual function dispatches on the object's real type at run time, so a call
// through a base pointer runs the derived override. A polymorphic base needs a
// virtual destructor so deleting through a base pointer frees the derived part.
#include <iostream>
#include <memory>
#include <string>

struct Animal {
    virtual std::string speak() const { return "..."; }
    virtual ~Animal() = default; // required for safe delete through Animal*
};

struct Dog : Animal {
    std::string speak() const override { return "woof"; }
};

struct Cat : Animal {
    std::string speak() const override { return "meow"; }
};

int main() {
    std::unique_ptr<Animal> a = std::make_unique<Dog>();
    std::cout << a->speak() << "\n"; // woof: dispatched on the real type

    a = std::make_unique<Cat>();
    std::cout << a->speak() << "\n"; // meow
    return 0;
}
