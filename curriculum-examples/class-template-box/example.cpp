// Positive example for cpp.templates.class_templates.lesson.
// A class template parameterizes a class by one or more types; each instantiation
// (Box<int>, Box<std::string>) is a separate type. (std::vector<T>, std::map<K,V>
// are class templates too.)
#include <iostream>
#include <string>

template <typename T>
class Box {
    T value;

public:
    explicit Box(T v) : value(v) {}
    T get() const { return value; }
};

int main() {
    Box<int> bi{42};
    Box<std::string> bs{"hi"};
    std::cout << bi.get() << "\n";
    std::cout << bs.get() << "\n";
    return 0;
}
