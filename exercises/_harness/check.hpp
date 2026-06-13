// Minimal standard-library test harness for cppFan write-code exercises (#81).
// No external dependency: define CHECK in each test's main(), then return REPORT().
#pragma once

#include <cstdio>

namespace exharness {
inline int checks = 0;
inline int failures = 0;
}  // namespace exharness

#define CHECK(cond)                                                       \
  do {                                                                    \
    ++exharness::checks;                                                  \
    if (!(cond)) {                                                        \
      ++exharness::failures;                                              \
      std::printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond);         \
    }                                                                     \
  } while (0)

// Prints a summary and yields a process exit code (0 = all passed).
#define REPORT()                                                          \
  (std::printf("%d/%d checks passed\n", exharness::checks - exharness::failures, \
               exharness::checks),                                        \
   exharness::failures == 0 ? 0 : 1)
