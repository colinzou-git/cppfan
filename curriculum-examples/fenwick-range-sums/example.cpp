// Positive example for dsa.techniques.range_structures.code_fenwick_trace.
// A Fenwick tree stores prefix sums with O(log n) point updates and queries.
#include <iostream>
#include <vector>

class Fenwick {
public:
    explicit Fenwick(int n) : bit_(n + 1, 0) {}

    void add(int index, int delta) {
        for (int i = index; i < static_cast<int>(bit_.size()); i += i & -i) {
            bit_[i] += delta;
        }
    }

    int sumPrefix(int index) const {
        int total = 0;
        for (int i = index; i > 0; i -= i & -i) {
            total += bit_[i];
        }
        return total;
    }

    int sumRange(int left, int right) const {
        return sumPrefix(right) - sumPrefix(left - 1);
    }

private:
    std::vector<int> bit_;
};

int main() {
    Fenwick tree(4);
    const std::vector<int> values{2, 1, 3, 0};
    for (int i = 0; i < static_cast<int>(values.size()); ++i) {
        tree.add(i + 1, values[i]);
    }

    tree.add(3, 4);
    std::cout << tree.sumPrefix(3) << "\n";
    std::cout << tree.sumRange(3, 3) << "\n";
    return 0;
}
