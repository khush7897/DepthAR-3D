#ifndef DEPTH_MESH_H
#define DEPTH_MESH_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

// Computes 3D heightmap vertex coordinates from raw image RGB bytes
void compute_3d_depth_mesh(
    const uint8_t* image_bytes,
    int width,
    int height,
    float depth_scale,
    float* out_vertices
);

#ifdef __cplusplus
}
#endif

#endif // DEPTH_MESH_H
