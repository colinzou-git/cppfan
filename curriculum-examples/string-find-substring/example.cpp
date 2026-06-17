// Positive example for dsa.strings.searching.lesson.
// std::string::find returns the start index of the first match, or
// std::string::npos when the pattern is not present.
#include <iostream>
#include <string>

int main() {
    std::string text = "the quick brown fox";

    std::cout << text.find("brown") << "\n"; // 10: start index of the match

    if (text.find("cat") == std::string::npos) {
        std::cout << "not found\n"; // "cat" is absent
    }

    std::cout << (text.find("quick") != std::string::npos ? "found" : "missing")
              << "\n"; // found
    return 0;
}
