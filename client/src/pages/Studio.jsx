import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, Upload, RotateCcw, X } from 'lucide-react';
import * as THREE from 'three';
import { projectAPI } from '../services/api';

const ThreeEngine = window.THREE || THREE;

export default function Studio({ currentUser }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Studio UI State
  const [imageSrc, setImageSrc] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [isConverted, setIsConverted] = useState(false);
  const [depthScale, setDepthScale] = useState(1.0);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  // Three.js refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const meshGroupRef = useRef(null);
  const reqIdRef = useRef(null);

  useEffect(() => {
    initThree();
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, []);

  const initThree = () => {
    if (!canvasRef.current) return;
    const T = window.THREE || THREE;

    const width = canvasRef.current.parentElement.clientWidth || window.innerWidth;
    const height = canvasRef.current.parentElement.clientHeight || window.innerHeight;

    const scene = new T.Scene();
    sceneRef.current = scene;

    const camera = new T.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 3.2);
    cameraRef.current = camera;

    const renderer = new T.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new T.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new T.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Default Hologram Sphere
    const meshGroup = new T.Group();
    meshGroupRef.current = meshGroup;
    scene.add(meshGroup);

    buildDefaultHologram(meshGroup);

    // Animation Loop
    let angle = 0;
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && meshGroupRef.current) {
        angle += 0.01;
        meshGroupRef.current.rotation.y = angle;
      }

      renderer.render(scene, camera);
    };

    animate();
  };

  const buildDefaultHologram = (group) => {
    const T = window.THREE || THREE;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const geo = new T.OctahedronGeometry(1.2, 2);
    const mat = new T.MeshPhongMaterial({
      color: 0x00e8c8,
      emissive: 0x00e8c8,
      emissiveIntensity: 0.4,
      wireframe: true
    });
    const mesh = new T.Mesh(geo, mat);
    group.add(mesh);
  };

  // Image Upload & 3D Extrusion Engine
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileObject(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        convertImageTo3D(img, src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const convertImageTo3D = (img, dataUrl) => {
    if (!meshGroupRef.current) return;
    const T = window.THREE || THREE;

    const group = meshGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Sample Image Brightness onto Canvas
    const sampleW = 100;
    const sampleH = Math.round(100 * (img.height / img.width));

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = sampleW;
    sampleCanvas.height = sampleH;
    const ctx = sampleCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, sampleW, sampleH);

    const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;

    // Build 3D Plane Geometry Vertices
    const aspect = img.width / img.height;
    const planeW = 2.4 * (aspect >= 1 ? 1 : aspect);
    const planeH = 2.4 / (aspect >= 1 ? aspect : 1);

    const geometry = new T.PlaneGeometry(planeW, planeH, sampleW - 1, sampleH - 1);
    const pos = geometry.attributes.position;

    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const vertIdx = y * sampleW + x;
        const pixelIdx = (y * sampleW + x) * 4;

        const r = imgData[pixelIdx];
        const g = imgData[pixelIdx + 1];
        const b = imgData[pixelIdx + 2];
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        pos.setZ(vertIdx, luminance * 0.5 * depthScale);
      }
    }

    geometry.computeVertexNormals();

    const texture = new T.CanvasTexture(sampleCanvas);
    texture.needsUpdate = true;

    const material = new T.MeshPhongMaterial({
      map: texture,
      side: T.DoubleSide,
      wireframe: wireframe,
      shininess: 80
    });

    const mesh = new T.Mesh(geometry, material);
    group.add(mesh);

    // Glowing Backing Bezel
    const frameGeo = new T.BoxGeometry(planeW + 0.1, planeH + 0.1, 0.05);
    const frameMat = new T.MeshBasicMaterial({ color: 0x00e8c8, wireframe: true });
    const frameMesh = new T.Mesh(frameGeo, frameMat);
    frameMesh.position.z = -0.05;
    group.add(frameMesh);

    setIsConverted(true);
  };

  const handleDepthScaleChange = (e) => {
    const val = parseFloat(e.target.value);
    setDepthScale(val);
    if (imageSrc) {
      const img = new Image();
      img.onload = () => convertImageTo3D(img, imageSrc);
      img.src = imageSrc;
    }
  };

  const toggleWireframe = () => {
    setWireframe(!wireframe);
    if (meshGroupRef.current && meshGroupRef.current.children[0]) {
      const mesh = meshGroupRef.current.children[0];
      if (mesh.material) mesh.material.wireframe = !wireframe;
    }
  };

  // Save to Database Handler
  const handleSaveToDatabase = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to save 3D models to your database.');
      navigate('/login');
      return;
    }

    if (!title) {
      alert('Please enter a title for your 3D project.');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('is_public', isPublic ? '1' : '0');
      formData.append('depth_map_data', JSON.stringify({ depthScale }));
      formData.append('mesh_settings_json', JSON.stringify({ wireframe, autoRotate }));

      if (fileObject) {
        formData.append('image', fileObject);
      } else if (imageSrc) {
        formData.append('original_image_path', imageSrc);
      }

      await projectAPI.create(formData);
      alert('3D AR Model saved successfully to database!');
      setShowSaveModal(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Save project error:', err);
      alert(err.response?.data?.error || 'Failed to save project to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: '64px', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Main Viewport Container */}
      <div style={{ position: 'relative', flexGrow: 1, background: '#060810' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* Top Action Header Bar */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <div className="glass-card" style={{ padding: '8px 16px', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--teal)" />
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem' }}>
              3D AR Studio Engine
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
            <button
              onClick={() => fileInputRef.current.click()}
              className="btn btn-primary"
            >
              <Upload size={16} />
              <span>{imageSrc ? 'Change Image' : 'Upload 2D Image'}</span>
            </button>

            <button
              onClick={() => setShowSaveModal(true)}
              className="btn btn-purple"
            >
              <Save size={16} />
              <span>Save to Database</span>
            </button>
          </div>
        </div>

        {/* Left Drawer Controls */}
        <div className="glass-card" style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          width: '240px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Mesh & Depth Controls
          </h4>

          {/* Depth Scale Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span>Depth Relief</span>
              <span style={{ color: 'var(--teal)' }}>{depthScale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={depthScale}
              onChange={handleDepthScaleChange}
              style={{ width: '100%', accentColor: 'var(--teal)' }}
            />
          </div>

          {/* Wireframe Toggle */}
          <button
            onClick={toggleWireframe}
            className="btn"
            style={{
              justifyContent: 'center',
              background: wireframe ? 'rgba(0, 232, 200, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: wireframe ? 'var(--teal)' : 'var(--border)',
              fontSize: '0.75rem'
            }}
          >
            <span>Wireframe: {wireframe ? 'ON' : 'OFF'}</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="btn"
            style={{
              justifyContent: 'center',
              background: autoRotate ? 'rgba(0, 232, 200, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: autoRotate ? 'var(--teal)' : 'var(--border)',
              fontSize: '0.75rem'
            }}
          >
            <RotateCcw size={14} />
            <span>Auto Rotate: {autoRotate ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Save to Database Modal */}
      {showSaveModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--teal)' }}>
                Save 3D Model to Database
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveToDatabase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '6px' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Cyberpunk Hologram 3D"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  className="form-input"
                  placeholder="Brief notes about this 3D model..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="public-check"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ accentColor: 'var(--teal)', width: '16px', height: '16px' }}
                />
                <label htmlFor="public-check" style={{ fontSize: '0.85rem', color: 'var(--text2)', cursor: 'pointer' }}>
                  Share publicly in Home Gallery
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ flexGrow: 1, justifyContent: 'center' }}
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Confirm Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
