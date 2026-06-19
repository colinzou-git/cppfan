// Positive example for dsa.techniques.dp_forms.code_knapsack_trace.
// Knapsack state is item prefix plus capacity; reconstruction walks backward
// through the choices that produced the optimal value.
#include <iostream>
#include <vector>

int main() {
    const std::vector<int> weight{10, 6, 4};
    const std::vector<int> value{60, 50, 50};
    const int capacity = 10;
    const int n = static_cast<int>(weight.size());
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(capacity + 1, 0));

    for (int i = 1; i <= n; ++i) {
        for (int w = 0; w <= capacity; ++w) {
            dp[i][w] = dp[i - 1][w];
            if (weight[i - 1] <= w) {
                dp[i][w] = std::max(dp[i][w], value[i - 1] + dp[i - 1][w - weight[i - 1]]);
            }
        }
    }

    std::cout << "value=" << dp[n][capacity] << "\n";
    int w = capacity;
    for (int i = n; i >= 1; --i) {
        if (dp[i][w] != dp[i - 1][w]) {
            std::cout << "take item\n";
            w -= weight[i - 1];
        }
    }
    return 0;
}
