#include "depth_mesh.h"
#include <cmath>

void compute_3d_depth_mesh(
    const uint8_t* image_bytes,
    int width,
    int height,
    float depth_scale,
    float* out_vertices
) {
    if (!image_bytes || !out_vertices || width <= 0 || height <= 0) return;

    float aspect = (float)height / (float)width;
    float dx = 2.0f / (width - 1);
    float dy = (2.0f * aspect) / (height - 1);

    int out_idx = 0;

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int pixel_idx = (y * width + x) * 3;

            uint8_t r = image_bytes[pixel_idx];
            uint8_t g = image_bytes[pixel_idx + 1];
            uint8_t b = image_bytes[pixel_idx + 2];

            // Grayscale luminance calculation
            float luminance = (0.299f * r + 0.587f * g + 0.114f * b) / 255.0f;

            float vx = -1.0f + x * dx;
            float vy = aspect - y * dy;
            float vz = luminance * 0.4f * depth_scale;

            float u = (float)x / (width - 1);
            float v = 1.0f - ((float)y / (height - 1));

            // Output 5 floats per vertex: [X, Y, Z, U, V]
            out_vertices[out_idx++] = vx;
            out_vertices[out_idx++] = vy;
            out_vertices[out_idx++] = vz;
            out_vertices[out_idx++] = u;
            out_vertices[out_idx++] = v;
        }
    }
}
