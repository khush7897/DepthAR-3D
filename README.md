# DepthAR — 2D to 3D Augmented Reality Converter 🚀

> **Turn any 2D photo into a photorealistic 3D AR spatial model with interactive component detection and spatial label anchoring.**

![DepthAR Banner](https://img.shields.io/badge/Three.js-r128-teal?style=for-the-badge&logo=three.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Python](https://img.shields.io/badge/Python-Kivy-yellow?style=for-the-badge&logo=python)
![C++](https://img.shields.io/badge/C++-Native_Engine-blue?style=for-the-badge&logo=cplusplus)

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/khush7897/DepthAR-3D)

---

## ✨ Features

- 📸 **Instant 2D-to-3D Depth Extrusion**: Converts portraits, cars, objects, landscapes, and architectural photos into 3D relief meshes instantly.
- 🎨 **Photorealistic PBR Shading & Normal Mapping**: Dynamic heightmap-to-normalmap conversion with specular lighting, anisotropic texture filtering, and high-DPI rendering.
- 🎯 **Interactive Click-to-Point 3D Highlighting**: Click any component label (e.g. *Car Bonnet*, *Windscreen*, *Roof*, *Wheel*) in the top-right panel to spawn a glowing 3D beacon pin and focus the camera on that exact 3D part.
- 🏷️ **AI Component Detection**: Uses Claude Vision AI to identify anatomical and structural components of subjects with depth estimation.
- 🌐 **Full-Stack Application**: Node.js/Express REST API backend with SQLite storage (`depthar.db`), JWT Authentication, and a modern Vite React frontend.
- 📱 **Mobile APK Ready**: Contains a Python/Kivy + C++ native depth engine ready for Android APK compilation via Buildozer.

---

## 🛠️ Project Structure

```
├── ar.html                # Standalone WebAR Studio application (Single-file ready)
├── client/                # React 18 + Vite frontend
├── server/                # Express REST API + SQLite Database backend
├── python_app/            # Kivy Mobile UI + Native C++ depth engine & Buildozer APK config
└── README.md
```

---

## 🚀 Quick Start

### 1. Standalone WebAR Studio (`ar.html`)
Simply open `ar.html` in any modern web browser or serve it via local HTTP server:
```bash
python -m http.server 8080
# Open http://localhost:8080/ar.html in Chrome
```

### 2. Full-Stack App (Node.js + Express + React)
```bash
# Start Express Backend
cd server
npm install
npm start

# Start Vite React Frontend
cd ../client
npm install
npm run dev
```

### 3. Android APK Compilation (Kivy + C++)
```bash
cd python_app
buildozer android debug
```

---

## 📄 License
MIT License © 2026 DepthAR Team
