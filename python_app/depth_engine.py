import numpy as np
from PIL import Image

class DepthEngine:
    @staticmethod
    def process_image_to_mesh(image_path, target_width=80, depth_scale=1.0):
        """
        Loads an image, converts pixels to grayscale luminance values,
        and generates 3D vertices, normals, and texture coordinates.
        """
        img = Image.open(image_path).convert('RGB')
        aspect = img.height / img.width
        target_height = int(target_width * aspect)
        
        img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        img_np = np.array(img_resized, dtype=np.float32)
        
        # Calculate pixel grayscale luminance (0.0 to 1.0)
        luminance = (0.299 * img_np[:, :, 0] + 0.587 * img_np[:, :, 1] + 0.114 * img_np[:, :, 2]) / 255.0
        
        vertices = []
        indices = []
        
        dx = 2.0 / (target_width - 1)
        dy = (2.0 * aspect) / (target_height - 1)
        
        # Build Vertex Buffer
        for y in range(target_height):
            for x in range(target_width):
                vx = -1.0 + x * dx
                vy = (aspect) - y * dy
                vz = luminance[y, x] * 0.4 * depth_scale
                
                u = x / (target_width - 1)
                v = 1.0 - (y / (target_height - 1))
                
                vertices.extend([vx, vy, vz, u, v])

        # Build Index Buffer
        for y in range(target_height - 1):
            for x in range(target_width - 1):
                top_left = y * target_width + x
                top_right = top_left + 1
                bottom_left = (y + 1) * target_width + x
                bottom_right = bottom_left + 1
                
                indices.extend([top_left, bottom_left, top_right])
                indices.extend([top_right, bottom_left, bottom_right])

        return {
            'vertices': np.array(vertices, dtype=np.float32),
            'indices': np.array(indices, dtype=np.uint32),
            'grid_size': (target_width, target_height),
            'aspect_ratio': aspect
        }
