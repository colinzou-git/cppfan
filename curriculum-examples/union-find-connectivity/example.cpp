// Positive example for dsa.trees.disjoint_set.lesson.
// Union-find tracks elements in disjoint groups: find(x) returns x's group
// representative and unite(a, b) merges groups. Path compression keeps both
// near-constant amortized, powering connectivity and cycle-detection queries.
#include <iostream>
#include <numeric>
#include <vector>

struct DSU {
    std::vector<int> parent;
    explicit DSU(int n) : parent(n) { std::iota(parent.begin(), parent.end(), 0); }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]]; // path compression
            x = parent[x];
        }
        return x;
    }

    void unite(int a, int b) { parent[find(a)] = find(b); }
};

int main() {
    DSU dsu(6);
    dsu.unite(0, 1);
    dsu.unite(1, 2);
    dsu.unite(3, 4);

    std::cout << (dsu.find(0) == dsu.find(2) ? "same" : "diff") << "\n"; // same
    std::cout << (dsu.find(0) == dsu.find(3) ? "same" : "diff") << "\n"; // diff
    std::cout << (dsu.find(3) == dsu.find(4) ? "same" : "diff") << "\n"; // same
    std::cout << (dsu.find(5) == dsu.find(0) ? "same" : "diff") << "\n"; // diff
    return 0;
}
