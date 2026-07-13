// Reference solution for dsu-number-of-islands.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <numeric>
#include <string>
#include <vector>

// Count 4-directionally connected components of '1' cells using a disjoint-set
// (union-find) over the land cells.
class DisjointSet {
 public:
  explicit DisjointSet(int n) : parent_(n), rank_(n, 0), count_(n) {
    std::iota(parent_.begin(), parent_.end(), 0);
  }

  int find(int x) {
    while (parent_[x] != x) {
      parent_[x] = parent_[parent_[x]];
      x = parent_[x];
    }
    return x;
  }

  void unite(int a, int b) {
    int ra = find(a);
    int rb = find(b);
    if (ra == rb) {
      return;
    }
    if (rank_[ra] < rank_[rb]) {
      std::swap(ra, rb);
    }
    parent_[rb] = ra;
    if (rank_[ra] == rank_[rb]) {
      ++rank_[ra];
    }
    --count_;
  }

  int count() const { return count_; }

 private:
  std::vector<int> parent_;
  std::vector<int> rank_;
  int count_;
};

inline int num_islands(const std::vector<std::string>& grid) {
  if (grid.empty() || grid[0].empty()) {
    return 0;
  }
  const int rows = static_cast<int>(grid.size());
  const int cols = static_cast<int>(grid[0].size());
  DisjointSet dsu(rows * cols);

  int land = 0;
  for (int r = 0; r < rows; ++r) {
    for (int c = 0; c < cols; ++c) {
      if (grid[r][c] != '1') {
        continue;
      }
      ++land;
      const int id = r * cols + c;
      if (r + 1 < rows && grid[r + 1][c] == '1') {
        dsu.unite(id, (r + 1) * cols + c);
      }
      if (c + 1 < cols && grid[r][c + 1] == '1') {
        dsu.unite(id, r * cols + (c + 1));
      }
    }
  }

  // count() starts at rows*cols; subtract the water cells that were never unioned.
  return dsu.count() - (rows * cols - land);
}
