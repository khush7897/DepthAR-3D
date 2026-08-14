import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, User, Calendar, Share2, Box } from 'lucide-react';
import * as THREE from 'three';
import { projectAPI } from '../services/api';

export default function Viewer({ currentUser }) {
  const { id } = useParams();
  const canvasRef = useRef(null);
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [favCount, setFavCount] = useState(0);

  const sceneRef = useRef(null);
  const meshGroupRef = useRef(null);
  const reqIdRef = useRef(null);

  useEffect(() => {
    fetchProject();
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getById(id);
      const proj = res.data.project;
      setProject(proj);
      setIsFavorited(Boolean(proj.is_favorited));
      setFavCount(proj.favorites_count || 0);

      initThreeViewer(proj);
    } catch (err) {
      setError('Failed to load 3D project from database.');
    } finally {
      setLoading(false);
    }
  };

  const initThreeViewer = (proj) => {
    if (!canvasRef.current) return;
    const T = window.THREE || THREE;

    const width = canvasRef.current.parentElement.clientWidth || window.innerWidth;
    const height = canvasRef.current.parentElement.clientHeight || window.innerHeight;

    const scene = new T.Scene();
    sceneRef.current = scene;

    const camera = new T.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 3.2);

    const renderer = new T.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new T.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new T.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const meshGroup = new T.Group();
    meshGroupRef.current = meshGroup;
    scene.add(meshGroup);

    // Build 3D Mesh from database stored project image
    if (proj.original_image_path) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const sampleW = 100;
        const sampleH = Math.round(100 * (img.height / img.width));

        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = sampleW;
        sampleCanvas.height = sampleH;
        const ctx = sampleCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, sampleW, sampleH);

        const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;

        const aspect = img.width / img.height;
        const planeW = 2.4 * (aspect >= 1 ? 1 : aspect);
        const planeH = 2.4 / (aspect >= 1 ? aspect : 1);

        const geometry = new T.PlaneGeometry(planeW, planeH, sampleW - 1, sampleH - 1);
        const pos = geometry.attributes.position;

        let depthScale = 1.0;
        try {
          const parsed = typeof proj.depth_map_data === 'string' ? JSON.parse(proj.depth_map_data) : proj.depth_map_data;
          if (parsed && parsed.depthScale) depthScale = parsed.depthScale;
        } catch (e) {}

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
          shininess: 80
        });

        const mesh = new T.Mesh(geometry, material);
        meshGroup.add(mesh);
      };
      img.src = proj.original_image_path;
    }

    let angle = 0;
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (meshGroupRef.current) {
        angle += 0.008;
        meshGroupRef.current.rotation.y = angle;
      }
      renderer.render(scene, camera);
    };
    animate();
  };

  const handleFavorite = async () => {
    if (!currentUser) {
      alert('Please log in to favorite.');
      return;
    }
    try {
      const res = await projectAPI.toggleFavorite(id);
      setIsFavorited(res.data.favorited);
      setFavCount(prev => res.data.favorited ? prev + 1 : prev - 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Model link copied to clipboard!');
  };

  if (loading) {
    return <div style={{ paddingTop: '100px', textAlign: 'center', color: 'var(--text2)' }}>Loading 3D AR Model...</div>;
  }

  if (error || !project) {
    return (
      <div style={{ paddingTop: '100px', textAlign: 'center' }}>
        <Box size={40} color="var(--red)" style={{ marginBottom: '12px' }} />
        <h2>3D Project Not Found</h2>
        <p style={{ color: 'var(--text2)', marginBottom: '20px' }}>{error}</p>
        <Link to="/" className="btn btn-primary">Return to Gallery</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '64px', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 3D Viewport */}
      <div style={{ position: 'relative', flexGrow: 1, background: '#060810' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* Top Floating Controls */}
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
          <Link to="/" className="btn glass-card" style={{ pointerEvents: 'auto' }}>
            <ArrowLeft size={16} />
            <span>Back to Gallery</span>
          </Link>

          <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
            <button onClick={handleFavorite} className="btn glass-card">
              <Heart size={16} fill={isFavorited ? 'var(--orange)' : 'none'} color={isFavorited ? 'var(--orange)' : 'var(--text)'} />
              <span>{favCount}</span>
            </button>
            <button onClick={handleShare} className="btn btn-primary">
              <Share2 size={16} />
              <span>Share 3D Model</span>
            </button>
          </div>
        </div>

        {/* Bottom Info Card */}
        <div className="glass-card" style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '540px',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--teal)' }}>
            {project.title}
          </h2>
          {project.description && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{project.description}</p>
          )}
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} /> {project.author_name || 'Anonymous'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
