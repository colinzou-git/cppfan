// Positive example for cpp.stl.adapters.lesson.
// Container adapters wrap a container with a restricted interface: stack is LIFO
// (top), queue is FIFO (front), priority_queue exposes the largest element first.
#include <iostream>
#include <queue>
#include <stack>

int main() {
    std::stack<int> s;
    s.push(1);
    s.push(2);
    s.push(3);
    std::cout << "stack " << s.top() << "\n"; // 3: last in, first out

    std::queue<int> q;
    q.push(1);
    q.push(2);
    q.push(3);
    std::cout << "queue " << q.front() << "\n"; // 1: first in, first out

    std::priority_queue<int> pq;
    pq.push(2);
    pq.push(5);
    pq.push(1);
    std::cout << "pq";
    while (!pq.empty()) {
        std::cout << " " << pq.top(); // largest first: 5 2 1
        pq.pop();
    }
    std::cout << "\n";
    return 0;
}
