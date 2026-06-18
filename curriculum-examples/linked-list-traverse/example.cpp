// Positive example for dsa.trees.linked_list.lesson.
// A singly linked list chains value+next nodes ending in null. Traversal follows
// next pointers; indexed access is O(n). Owning nodes with unique_ptr makes the
// chain clean itself up (no manual delete).
#include <iostream>
#include <memory>

struct Node {
    int value;
    std::unique_ptr<Node> next;
    explicit Node(int v) : value(v) {}
};

int main() {
    std::unique_ptr<Node> head;
    for (int v : {30, 20, 10}) { // push front -> list becomes 10 -> 20 -> 30
        auto n = std::make_unique<Node>(v);
        n->next = std::move(head);
        head = std::move(n);
    }

    for (Node* p = head.get(); p != nullptr; p = p->next.get()) {
        std::cout << p->value << " "; // 10 20 30
    }
    std::cout << "\n";

    Node* p = head.get();
    for (int i = 0; i < 2; ++i) p = p->next.get(); // O(n) indexed access
    std::cout << p->value << "\n"; // 30 (index 2)
    return 0;
}
