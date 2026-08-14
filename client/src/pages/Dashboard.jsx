import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search, Box } from 'lucide-react';
import { projectAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';

export default function Dashboard({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchMyProjects();
  }, [currentUser]);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getAll('my');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch user projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this 3D project from your database?')) {
      return;
    }
    try {
      await projectAPI.delete(id);
      fetchMyProjects();
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  const handleFavorite = async (id) => {
    try {
      await projectAPI.toggleFavorite(id);
      fetchMyProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', paddingInline: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderKanban color="var(--teal)" size={28} />
            <span>My 3D Models Database</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text2)', marginTop: '4px' }}>
            Manage your saved 2D-to-3D AR conversions and spatial models.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="var(--text3)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search my database..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <Link to="/studio" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            <Plus size={18} />
            <span>New 3D Conversion</span>
          </Link>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text2)' }}>Loading your saved 3D models...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Box size={48} color="var(--text3)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>No Saved 3D Models Yet</h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '480px', marginInline: 'auto' }}>
            You haven't saved any 3D models to your database. Upload a 2D image in the AR Studio to convert and save your first project!
          </p>
          <Link to="/studio" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <Plus size={18} />
            <span>Create 3D Model Now</span>
          </Link>
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
              onDelete={handleDelete}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
