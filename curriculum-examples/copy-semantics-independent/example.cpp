// Positive example for cpp.value_semantics.copy.lesson.
// Copying makes an independent duplicate: both copy construction and copy
// assignment of a value-holding object leave the original untouched (the
// std::vector member copies itself correctly).
#include <iostream>
#include <vector>

struct Bag {
    std::vector<int> items;
};

int main() {
    Bag a;
    a.items = {1, 2, 3};

    Bag b = a; // copy construction -> independent duplicate
    b.items.push_back(4);

    Bag c;
    c = a; // copy assignment -> also independent
    c.items.push_back(9);
    c.items.push_back(9);

    std::cout << a.items.size() << "\n"; // 3: original untouched
    std::cout << b.items.size() << "\n"; // 4
    std::cout << c.items.size() << "\n"; // 5
    return 0;
}
