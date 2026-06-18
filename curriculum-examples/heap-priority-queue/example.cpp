// Positive example for dsa.trees.heap.lesson.
// A binary heap gives O(1) access to the best element and O(log n) push/pop.
// std::priority_queue is a max-heap by default (min-heap with std::greater), and
// std::make_heap turns a range into a heap in place.
#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <vector>

int main() {
    std::priority_queue<int> maxHeap;
    for (int x : {3, 1, 4, 1, 5}) maxHeap.push(x);
    std::cout << maxHeap.top() << "\n"; // 5: largest on top

    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
    for (int x : {3, 1, 4, 1, 5}) minHeap.push(x);
    std::cout << minHeap.top() << "\n"; // 1: smallest on top

    std::vector<int> v = {2, 8, 6, 1};
    std::make_heap(v.begin(), v.end());
    std::cout << v.front() << "\n"; // 8: max-heap root at the front
    return 0;
}
