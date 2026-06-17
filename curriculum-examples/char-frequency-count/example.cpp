// Positive example for dsa.strings.char_frequency.lesson.
// Counting characters in one O(n) pass with a fixed count[26] array (indexed by
// c - 'a') powers anagram checks and first-unique-character queries.
#include <array>
#include <iostream>
#include <string>

bool areAnagrams(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) return false;
    std::array<int, 26> count{}; // zero-initialized
    for (char c : a) ++count[c - 'a'];
    for (char c : b) --count[c - 'a'];
    for (int n : count) {
        if (n != 0) return false;
    }
    return true;
}

int main() {
    std::cout << (areAnagrams("listen", "silent") ? "yes" : "no") << "\n"; // yes
    std::cout << (areAnagrams("hello", "world") ? "yes" : "no") << "\n";   // no

    std::string s = "aabbcd";
    std::array<int, 26> freq{};
    for (char c : s) ++freq[c - 'a'];
    for (char c : s) {
        if (freq[c - 'a'] == 1) {
            std::cout << "first unique: " << c << "\n"; // c
            break;
        }
    }
    return 0;
}
