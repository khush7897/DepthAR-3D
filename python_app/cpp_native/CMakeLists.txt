cmake_minimum_required(VERSION 3.10.2)
project(depth_mesh_native)

add_library(
    depth_mesh_native
    SHARED
    depth_mesh.cpp
)

target_include_directories(
    depth_mesh_native
    PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
)
