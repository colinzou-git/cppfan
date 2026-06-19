// Positive example for dsa.techniques.dp_forms.code_subsequence_trace.
// LCS uses prefix states; a character match extends dp[i-1][j-1].
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

int main() {
    const std::string a = "ABCDE";
    const std::string b = "ACE";
    std::vector<std::vector<int>> dp(a.size() + 1, std::vector<int>(b.size() + 1, 0));

    for (std::size_t i = 1; i <= a.size(); ++i) {
        for (std::size_t j = 1; j <= b.size(); ++j) {
            if (a[i - 1] == b[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    std::string answer;
    std::size_t i = a.size();
    std::size_t j = b.size();
    while (i > 0 && j > 0) {
        if (a[i - 1] == b[j - 1]) {
            answer.push_back(a[i - 1]);
            --i;
            --j;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            --i;
        } else {
            --j;
        }
    }
    std::reverse(answer.begin(), answer.end());

    std::cout << dp[a.size()][b.size()] << "\n";
    std::cout << answer << "\n";
    return 0;
}
