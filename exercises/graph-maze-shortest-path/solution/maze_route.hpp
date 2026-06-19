// Reference solution for graph-maze-shortest-path.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <array>
#include <queue>
#include <string>
#include <utility>
#include <vector>

inline int shortest_maze_route(const std::vector<std::string>& grid) {
  if (grid.empty() || grid.front().empty()) return -1;

  const int rows = static_cast<int>(grid.size());
  const int cols = static_cast<int>(grid.front().size());
  std::pair<int, int> start{-1, -1};
  std::pair<int, int> goal{-1, -1};

  for (int r = 0; r < rows; ++r) {
    if (static_cast<int>(grid[r].size()) != cols) return -1;
    for (int c = 0; c < cols; ++c) {
      if (grid[r][c] == 'S') start = {r, c};
      if (grid[r][c] == 'G') goal = {r, c};
    }
  }

  if (start.first == -1) return -1;
  if (goal.first == -1) {
    return rows == 1 && cols == 1 ? 0 : -1;
  }

  std::vector<std::vector<int>> dist(rows, std::vector<int>(cols, -1));
  std::queue<std::pair<int, int>> q;
  dist[start.first][start.second] = 0;
  q.push(start);

  constexpr std::array<std::pair<int, int>, 4> dirs{{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}};
  while (!q.empty()) {
    const auto [r, c] = q.front();
    q.pop();
    if (std::pair<int, int>{r, c} == goal) return dist[r][c];

    for (const auto [dr, dc] : dirs) {
      const int nr = r + dr;
      const int nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      q.push({nr, nc});
    }
  }

  return -1;
}
