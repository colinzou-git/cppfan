// Positive example for dsa.strings.manipulation.lesson.
// std::string has size, operator[], and substr (which returns a copy); build a
// long string by appending in place with += rather than repeated s = s + piece.
#include <iostream>
#include <string>

int main() {
    std::string s = "cppFan";
    std::cout << s.size() << "\n";       // 6
    std::cout << s[0] << "\n";           // c
    std::cout << s.substr(3, 3) << "\n"; // Fan (a new string)

    std::string out;
    for (int i = 0; i < 3; ++i) {
        out += "ab"; // append in place (linear), not out = out + "ab"
    }
    std::cout << out << "\n"; // ababab
    return 0;
}
