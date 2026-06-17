// Positive example for dsa.strings.case_handling.lesson.
// <cctype> classifies/converts characters, but tolower/isdigit/etc. are
// undefined behavior on a negative char — always pass
// static_cast<unsigned char>(c). Fold both sides to one case to compare.
#include <cctype>
#include <iostream>
#include <string>

std::string toLowerCopy(const std::string& s) {
    std::string out;
    for (char c : s) {
        out += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    }
    return out;
}

bool equalsIgnoreCase(const std::string& a, const std::string& b) {
    return toLowerCopy(a) == toLowerCopy(b);
}

int main() {
    std::cout << toLowerCopy("HeLLo") << "\n"; // hello
    std::cout << (equalsIgnoreCase("CppFan", "cppfan") ? "same" : "different")
              << "\n"; // same

    char digit = '7';
    char letter = 'x';
    std::cout << (std::isdigit(static_cast<unsigned char>(digit)) ? "digit" : "not")
              << "\n"; // digit
    std::cout << (std::isalpha(static_cast<unsigned char>(letter)) ? "alpha" : "not")
              << "\n"; // alpha
    return 0;
}
