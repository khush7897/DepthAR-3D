import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, Box, Search, Compass, Shield, ArrowRight } from 'lucide-react';
import { projectAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';

export default function Home({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getAll('public');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load public gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (id) => {
    if (!currentUser) {
      alert('Please log in to favorite projects.');
      return;
    }
    try {
      await projectAPI.toggleFavorite(id);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '80px 24px 60px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(0, 232, 200, 0.15) 0%, transparent 60%)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(0, 232, 200, 0.1)',
          border: '1px solid rgba(0, 232, 200, 0.3)',
          color: 'var(--teal)',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <Sparkles size={14} />
          <span>AI 2D TO 3D AR CONVERTER & DATABASE ENGINE</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-head)',
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '20px',
          maxWidth: '900px',
          marginInline: 'auto'
        }}>
          Transform 2D Photos into <br />
          <span style={{
            background: 'linear-gradient(90deg, #ffffff, var(--teal))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Interactive 3D AR Holograms</span>
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text2)',
          maxWidth: '640px',
          marginInline: 'auto',
          marginBottom: '36px',
          lineHeight: 1.6
        }}>
          Upload any photograph, diagram, or art. Our depth extraction mesh generator converts it into a full 3D spatial model saved directly to your personal database.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/studio" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Sparkles size={18} />
            <span>Open 3D AR Studio</span>
            <ArrowRight size={16} />
          </Link>
          
          {!currentUser && (
            <Link to="/register" className="btn btn-purple" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <span>Create Account</span>
            </Link>
          )}
        </div>

        {/* Feature Highlights Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '60px auto 0',
          textAlign: 'left'
        }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <Layers color="var(--teal)" size={24} style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>2D to 3D Depthmap</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Extracts heightmaps and vertex normals to build volumetric 3D models from flat images.</p>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <Box color="var(--purple)" size={24} style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Persistent Database</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Save your 3D models, mesh settings, and labels securely to SQLite database storage.</p>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <Shield color="var(--blue)" size={24} style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>WebXR & Camera AR</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Project your converted 3D models directly onto your room using camera WebAR stream.</p>
          </div>
        </div>
      </section>

      {/* Public Models Showcase Gallery */}
      <section style={{ padding: '40px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass color="var(--teal)" size={24} />
              <span>Public 3D AR Model Gallery</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>Explore 3D conversions created by the community.</p>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <Search size={16} color="var(--text3)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search 3D models..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text2)' }}>Loading 3D models database...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
            <Box size={40} color="var(--text3)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No 3D Models Found</h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '20px' }}>Be the first to convert and save a 2D image into 3D AR!</p>
            <Link to="/studio" className="btn btn-primary">Open 3D AR Studio</Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUser={currentUser}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
