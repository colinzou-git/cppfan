// Positive example for dsa.strings.palindrome.lesson.
// A palindrome check uses two pointers starting at each end, comparing and
// stepping inward until they meet — O(n) time and O(1) extra space.
#include <iostream>
#include <string>

bool isPalindrome(const std::string& s) {
    int i = 0;
    int j = static_cast<int>(s.size()) - 1;
    while (i < j) {
        if (s[i] != s[j]) return false;
        ++i;
        --j;
    }
    return true;
}

int main() {
    std::cout << (isPalindrome("racecar") ? "yes" : "no") << "\n"; // yes
    std::cout << (isPalindrome("hello") ? "yes" : "no") << "\n";   // no
    std::cout << (isPalindrome("abba") ? "yes" : "no") << "\n";    // yes
    return 0;
}
