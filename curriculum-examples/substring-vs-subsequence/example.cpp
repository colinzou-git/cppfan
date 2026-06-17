// Positive example for dsa.strings.substring_subsequence.lesson.
// A substring is a contiguous slice; a subsequence preserves order but may skip
// characters. Every substring is a subsequence, not the reverse: in "abcde",
// "ace" is a subsequence but not a substring.
#include <iostream>
#include <string>

bool isSubsequence(const std::string& sub, const std::string& s) {
    std::size_t j = 0;
    for (char c : s) {
        if (j < sub.size() && c == sub[j]) ++j;
    }
    return j == sub.size();
}

int main() {
    std::string s = "abcde";
    std::size_t n = s.size();
    std::cout << n * (n + 1) / 2 << "\n"; // 15: count of non-empty substrings

    std::cout << (s.find("bcd") != std::string::npos ? "substring" : "no") << "\n";        // substring
    std::cout << (isSubsequence("ace", s) ? "subsequence" : "no") << "\n";                 // subsequence
    std::cout << (s.find("ace") != std::string::npos ? "substring" : "not substring") << "\n"; // not substring
    return 0;
}
