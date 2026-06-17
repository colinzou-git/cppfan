// Positive example for dsa.trees.bst_search.lesson.
// A BST keeps smaller keys left and larger keys right, so search compares the
// target to the current node and descends one level each step — O(h).
#include <iostream>
#include <memory>

struct Node {
    int key;
    std::unique_ptr<Node> left;
    std::unique_ptr<Node> right;
    explicit Node(int k) : key(k) {}
};

void insert(std::unique_ptr<Node>& root, int k) {
    if (!root) {
        root = std::make_unique<Node>(k);
        return;
    }
    if (k < root->key) insert(root->left, k);
    else if (k > root->key) insert(root->right, k);
}

bool contains(const Node* n, int target) {
    while (n) {
        if (target == n->key) return true;
        n = (target < n->key) ? n->left.get() : n->right.get(); // descend
    }
    return false;
}

int main() {
    std::unique_ptr<Node> root;
    for (int k : {50, 30, 70, 20, 40, 60}) insert(root, k);

    std::cout << (contains(root.get(), 40) ? "found" : "missing") << "\n"; // found
    std::cout << (contains(root.get(), 65) ? "found" : "missing") << "\n"; // missing
    std::cout << (contains(root.get(), 70) ? "found" : "missing") << "\n"; // found
    return 0;
}
