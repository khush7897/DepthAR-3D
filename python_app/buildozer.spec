[app]

# (str) Title of your application
title = DepthAR

# (str) Package name
package.name = depthar

# (str) Package domain (needed for android/ios packaging)
package.domain = org.depthar

# (str) Source code where the main.py live
source.dir = .

# (list) Source files to include (let empty to include all the files)
source.include_exts = py,png,jpg,jpeg,kv,atlas,json,cpp,h,txt

# (str) Application versioning
version = 1.0.0

# (list) Application requirements
# comma separated e.g. requirements = sqlite3,kivy
requirements = python3,kivy,kivymd,numpy,pillow,pyopengl,sqlite3

# (str) Supported orientation (one of landscape, sensorLandscape, portrait or all)
orientation = portrait

# (bool) Indicate if the application should be fullscreen or not
fullscreen = 1

# (list) Permissions
android.permissions = CAMERA,READ_EXTERNAL_STORAGE,WRITE_EXTERNAL_STORAGE,INTERNET

# (int) Target Android API, should be as high as possible.
android.api = 33

# (int) Minimum API required
android.minapi = 21

# (int) Android NDK version
android.ndk = 25b

# (str) Android NDK architecture (arm64-v8a, armeabi-v7a, x86, x86_64)
android.archs = arm64-v8a, armeabi-v7a

# (bool) Enable AndroidX support
android.enable_androidx = True

# (list) C++ Native sources to compile
# android.add_src = cpp_native/depth_mesh.cpp

[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug (with command output))
log_level = 2

# (str) Path to build artifact storage
build_dir = ./.buildozer

# (str) Path to final package directory
bin_dir = ./bin
