// Positive example for dsa.graphs.mst.lesson.
// Kruskal sorts edges by weight and uses DSU to skip cycle-forming edges.
#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <tuple>
#include <vector>

struct DSU {
    std::vector<int> parent;
    explicit DSU(int n) : parent(n) {
        std::iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] == x) return x;
        parent[x] = find(parent[x]);
        return parent[x];
    }
    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        parent[b] = a;
        return true;
    }
};

int main() {
    std::vector<std::tuple<int, int, int, std::string>> edges{
        {1, 1, 2, "B-C"},
        {1, 2, 3, "C-D"},
        {2, 0, 1, "A-B"},
        {2, 1, 3, "B-D"},
        {5, 0, 3, "A-D"},
    };
    std::sort(edges.begin(), edges.end());

    DSU dsu(4);
    int total = 0;
    std::vector<std::string> chosen;
    for (const auto& [weight, u, v, name] : edges) {
        if (dsu.unite(u, v)) {
            total += weight;
            chosen.push_back(name);
        }
    }

    std::sort(chosen.begin(), chosen.end());
    std::cout << "total=" << total << "\n";
    for (std::size_t i = 0; i < chosen.size(); ++i) {
        if (i > 0) std::cout << " ";
        std::cout << chosen[i];
    }
    std::cout << "\n";
    return 0;
}
