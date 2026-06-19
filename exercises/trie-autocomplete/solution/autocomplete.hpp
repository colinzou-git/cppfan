// Reference solution for trie-autocomplete.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <map>
#include <memory>
#include <string>
#include <vector>

class AutocompleteIndex {
 public:
  explicit AutocompleteIndex(const std::vector<std::string>& words) {
    for (const auto& word : words) {
      insert(word);
    }
  }

  void insert(const std::string& word) {
    Node* node = &root_;
    for (char ch : word) {
      auto& next = node->children[ch];
      if (!next) {
        next = std::make_unique<Node>();
      }
      node = next.get();
    }
    node->is_word = true;
  }

  bool contains(const std::string& word) const {
    const Node* node = findNode(word);
    return node != nullptr && node->is_word;
  }

  std::vector<std::string> suggestions(const std::string& prefix, int limit) const {
    std::vector<std::string> out;
    if (limit <= 0) {
      return out;
    }

    const Node* node = findNode(prefix);
    if (node == nullptr) {
      return out;
    }

    std::string current = prefix;
    collect(*node, current, limit, out);
    return out;
  }

 private:
  struct Node {
    bool is_word = false;
    std::map<char, std::unique_ptr<Node>> children;
  };

  Node root_;

  const Node* findNode(const std::string& text) const {
    const Node* node = &root_;
    for (char ch : text) {
      auto it = node->children.find(ch);
      if (it == node->children.end()) {
        return nullptr;
      }
      node = it->second.get();
    }
    return node;
  }

  static void collect(const Node& node, std::string& current, int limit, std::vector<std::string>& out) {
    if (static_cast<int>(out.size()) >= limit) {
      return;
    }
    if (node.is_word) {
      out.push_back(current);
      if (static_cast<int>(out.size()) >= limit) {
        return;
      }
    }
    for (const auto& [ch, child] : node.children) {
      current.push_back(ch);
      collect(*child, current, limit, out);
      current.pop_back();
      if (static_cast<int>(out.size()) >= limit) {
        return;
      }
    }
  }
};
