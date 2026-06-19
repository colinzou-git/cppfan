// Positive example for dsa.trees.dsu_internals.code_union_trace.
// Path compression rewrites every node on the find path to point at the root.
#include <iostream>
#include <numeric>
#include <vector>

struct DSU {
    std::vector<int> parent;
    std::vector<int> rank;

    explicit DSU(int n) : parent(n), rank(n, 0) {
        std::iota(parent.begin(), parent.end(), 0);
    }

    int find(int x) {
        if (parent[x] == x) return x;
        parent[x] = find(parent[x]);
        return parent[x];
    }

    bool same(int a, int b) {
        return find(a) == find(b);
    }
};

int main() {
    DSU dsu(6);
    dsu.parent = {0, 0, 1, 2, 3, 5};
    dsu.rank = {3, 0, 0, 0, 0, 0};

    std::cout << "representative=" << dsu.find(4) << "\n";

    for (std::size_t i = 0; i < dsu.parent.size(); ++i) {
        if (i > 0) std::cout << " ";
        std::cout << dsu.parent[i];
    }
    std::cout << "\n";

    std::cout << (dsu.same(2, 4) ? "same" : "separate") << "\n";
    std::cout << (dsu.same(4, 5) ? "same" : "separate") << "\n";
    return 0;
}
