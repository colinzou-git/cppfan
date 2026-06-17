// Positive example for cpp.stl.map.lesson.
// std::map<K,V> stores unique keys kept sorted by key (so iteration order is
// deterministic), and contains() checks for a key without inserting it.
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> m;
    m["banana"] = 3;
    m["apple"] = 5;
    m["cherry"] = 2;

    for (const auto& [key, value] : m) {
        std::cout << key << "=" << value << " "; // sorted: apple, banana, cherry
    }
    std::cout << "\n";

    std::cout << (m.contains("apple") ? "has apple" : "no apple") << "\n";
    std::cout << (m.contains("kiwi") ? "has kiwi" : "no kiwi") << "\n";
    return 0;
}
