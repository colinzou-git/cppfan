// Positive example for cpp.oop.composition.lesson.
// Composition models a "has-a" relationship: a Car owns an Engine and a Logger
// as members and delegates work to them through their public interfaces.
#include <iostream>
#include <string>

class Engine {
public:
    std::string start() const { return "engine started"; }
};

class Logger {
public:
    std::string tag(const std::string& msg) const { return "[log] " + msg; }
};

class Car {
public:
    std::string drive() const { return log_.tag(engine_.start() + ", moving"); }
    int wheels() const { return 4; }

private:
    Engine engine_; // has-a Engine
    Logger log_;    // has-a Logger
};

int main() {
    Car c;
    std::cout << c.drive() << "\n";  // [log] engine started, moving
    std::cout << c.wheels() << "\n"; // 4
    return 0;
}
