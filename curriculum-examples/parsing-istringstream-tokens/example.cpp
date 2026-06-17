// Positive example for dsa.strings.parsing.lesson.
// Tokenize by streaming a line through std::istringstream: >> reads
// whitespace-separated tokens (and converts numbers), while
// std::getline(stream, token, ',') splits on a custom delimiter.
#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream words("the quick brown fox");
    std::string w;
    int count = 0;
    while (words >> w) ++count;
    std::cout << "words: " << count << "\n"; // 4

    std::istringstream nums("10 20 30");
    int a = 0, b = 0, c = 0;
    nums >> a >> b >> c; // >> converts text to int
    std::cout << "sum: " << (a + b + c) << "\n"; // 60

    std::istringstream csv("red,green,blue");
    std::string field;
    while (std::getline(csv, field, ',')) {
        std::cout << field << "\n"; // red / green / blue
    }
    return 0;
}
