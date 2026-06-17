// Positive example for cpp.oop.inheritance.lesson.
// Public inheritance models an "is-a" relationship: a Dog is-an Animal, so it
// inherits the base's public members and can add its own behavior.
#include <iostream>
#include <string>
#include <utility>

class Animal {
public:
    explicit Animal(std::string name) : name_(std::move(name)) {}
    std::string name() const { return name_; }
    std::string describe() const { return name_ + " is an animal"; }

private:
    std::string name_;
};

class Dog : public Animal {
public:
    explicit Dog(std::string name) : Animal(std::move(name)) {}
    std::string fetch() const { return name() + " fetches"; } // adds its own behavior
};

int main() {
    Dog d("Rex");
    std::cout << d.describe() << "\n"; // Rex is an animal (inherited)
    std::cout << d.fetch() << "\n";    // Rex fetches (added by Dog)
    return 0;
}
