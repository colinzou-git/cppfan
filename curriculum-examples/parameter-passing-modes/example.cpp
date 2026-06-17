// Positive example for cpp.references.parameter_passing.lesson.
// Pass small types by value, large read-only inputs by const T&, and use a
// non-const T& when the function must write back to the caller's object.
#include <iostream>
#include <string>

int doubled(int n) { return n * 2; } // small, cheap to copy: by value

std::size_t length(const std::string& s) { return s.size(); } // read-only: const&

void append(std::string& s, const std::string& suffix) { // output parameter: non-const&
    s += suffix;
}

int main() {
    std::cout << doubled(21) << "\n"; // 42

    std::string name = "cpp";
    std::cout << length(name) << "\n"; // 3

    append(name, "Fan");
    std::cout << name << "\n"; // cppFan
    return 0;
}
