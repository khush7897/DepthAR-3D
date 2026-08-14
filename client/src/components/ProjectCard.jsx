import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Trash2, Calendar, User, Share2 } from 'lucide-react';

export default function ProjectCard({ project, currentUser, onDelete, onFavorite }) {
  const isOwner = currentUser && currentUser.id === project.user_id;

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/viewer/${project.id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image Thumbnail Header */}
      <div style={{ position: 'relative', width: '100%', height: '180px', background: '#0a0d18', overflow: 'hidden' }}>
        <img
          src={project.original_image_path || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
          alt={project.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 50%, rgba(6, 8, 16, 0.9) 100%)'
        }} />

        {/* Badge Overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px'
        }}>
          <button
            onClick={(e) => { e.preventDefault(); onFavorite && onFavorite(project.id); }}
            style={{
              background: 'rgba(6, 8, 16, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '4px 10px',
              color: project.is_favorited ? 'var(--orange)' : 'var(--text2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            <Heart size={12} fill={project.is_favorited ? 'var(--orange)' : 'none'} />
            <span>{project.favorites_count || 0}</span>
          </button>
        </div>
      </div>

      {/* Body Info */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '8px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-head)' }}>
          {project.title}
        </h3>
        
        {project.description && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text2)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text3)', marginTop: 'auto', paddingTop: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} />
            {project.author_name || 'Anonymous'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Card Actions Footer */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <Link
            to={`/viewer/${project.id}`}
            className="btn btn-primary"
            style={{ flexGrow: 1, justifyContent: 'center', padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <Eye size={14} />
            <span>View 3D AR</span>
          </Link>

          <button
            onClick={handleShare}
            className="btn"
            style={{ padding: '6px 10px' }}
            title="Share Link"
          >
            <Share2 size={14} />
          </button>

          {isOwner && (
            <button
              onClick={() => onDelete(project.id)}
              className="btn btn-danger"
              style={{ padding: '6px 10px' }}
              title="Delete Project"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
