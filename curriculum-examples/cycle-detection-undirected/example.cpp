// Positive example for dsa.graphs.cycle_detection.lesson.
// In an undirected graph, a DFS that reaches an already-visited vertex which is
// NOT the immediate parent has found a cycle; the edge back to the parent must
// be skipped so it is not mistaken for one.
#include <iostream>
#include <vector>

bool hasCycle(int u, int parent, const std::vector<std::vector<int>>& adj,
              std::vector<bool>& visited) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) {
            if (hasCycle(v, u, adj, visited)) return true;
        } else if (v != parent) {
            return true; // visited, non-parent => cycle
        }
    }
    return false;
}

int main() {
    std::vector<std::vector<int>> a(3); // triangle 0-1-2-0 (has a cycle)
    auto addA = [&](int x, int y) { a[x].push_back(y); a[y].push_back(x); };
    addA(0, 1);
    addA(1, 2);
    addA(2, 0);
    std::vector<bool> va(3, false);
    std::cout << (hasCycle(0, -1, a, va) ? "cycle" : "acyclic") << "\n"; // cycle

    std::vector<std::vector<int>> b(3); // path 0-1-2 (a tree, no cycle)
    auto addB = [&](int x, int y) { b[x].push_back(y); b[y].push_back(x); };
    addB(0, 1);
    addB(1, 2);
    std::vector<bool> vb(3, false);
    std::cout << (hasCycle(0, -1, b, vb) ? "cycle" : "acyclic") << "\n"; // acyclic
    return 0;
}
