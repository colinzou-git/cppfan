// Positive example for dsa.trees.traversal.lesson.
// Depth-first traversals differ only in when the node is visited: preorder
// (N,L,R), inorder (L,N,R), postorder (L,R,N). On a BST, inorder yields sorted
// order.
#include <iostream>
#include <memory>

struct Node {
    int value;
    std::unique_ptr<Node> left;
    std::unique_ptr<Node> right;
    explicit Node(int v) : value(v) {}
};

void insert(std::unique_ptr<Node>& root, int v) {
    if (!root) {
        root = std::make_unique<Node>(v);
        return;
    }
    if (v < root->value) insert(root->left, v);
    else insert(root->right, v);
}

void preorder(const Node* n) {
    if (!n) return;
    std::cout << n->value << " ";
    preorder(n->left.get());
    preorder(n->right.get());
}

void inorder(const Node* n) {
    if (!n) return;
    inorder(n->left.get());
    std::cout << n->value << " ";
    inorder(n->right.get());
}

void postorder(const Node* n) {
    if (!n) return;
    postorder(n->left.get());
    postorder(n->right.get());
    std::cout << n->value << " ";
}

int main() {
    std::unique_ptr<Node> root;
    for (int v : {5, 3, 8, 1, 4}) insert(root, v);

    preorder(root.get());
    std::cout << "\n"; // 5 3 1 4 8
    inorder(root.get());
    std::cout << "\n"; // 1 3 4 5 8 (sorted)
    postorder(root.get());
    std::cout << "\n"; // 1 4 3 8 5
    return 0;
}
