cmake_minimum_required(VERSION 3.20)
project(cppfan_tooling_status_parser LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(CPPFAN_IMPL_DIR "${CMAKE_CURRENT_SOURCE_DIR}/starter" CACHE PATH "Directory containing status_parser.hpp")
option(CPPFAN_ENABLE_SANITIZERS "Enable AddressSanitizer and UndefinedBehaviorSanitizer" ON)

add_executable(status_parser_tests tests/tests.cpp)
target_include_directories(
  status_parser_tests
  PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../_harness"
    "${CPPFAN_IMPL_DIR}"
)

target_compile_options(status_parser_tests PRIVATE -Wall -Wextra -Wpedantic)

if(CPPFAN_ENABLE_SANITIZERS AND CMAKE_CXX_COMPILER_ID MATCHES "Clang|GNU")
  target_compile_options(status_parser_tests PRIVATE -fsanitize=address,undefined -fno-omit-frame-pointer)
  target_link_options(status_parser_tests PRIVATE -fsanitize=address,undefined)
endif()

enable_testing()
add_test(NAME tooling_status_parser_tests COMMAND status_parser_tests)
