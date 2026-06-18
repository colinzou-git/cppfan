// Positive example for dsa.trees.list_vs_vector.lesson.
// std::vector is the cache-friendly default (contiguous storage, push_back +
// index). std::list's niche is O(1) insertion given an iterator to the position.
#include <iostream>
#include <list>
#include <vector>

int main() {
    std::vector<int> v;
    for (int x : {1, 2, 3}) v.push_back(x); // amortized O(1) append
    std::cout << v.size() << " " << v[2] << "\n"; // 3 3 (contiguous, O(1) index)

    std::list<int> lst = {1, 2, 4};
    auto it = lst.begin();
    ++it;
    ++it;              // points at 4
    lst.insert(it, 3); // O(1) splice given the position -> 1 2 3 4
    for (int x : lst) std::cout << x << " ";
    std::cout << "\n"; // 1 2 3 4
    return 0;
}
