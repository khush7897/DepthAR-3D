import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, LogOut, User, Sparkles, FolderKanban, LogIn, UserPlus } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: '64px',
      background: 'rgba(6, 8, 16, 0.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--teal), var(--teal2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(0, 232, 200, 0.4)'
        }}>
          <Box size={18} color="#060810" />
        </div>
        <span style={{
          fontFamily: 'var(--font-head)',
          fontSize: '1.25rem',
          fontWeight: 800,
          letterSpacing: '1px',
          color: 'var(--text)'
        }}>
          Depth<span style={{ color: 'var(--teal)' }}>AR</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{
          color: isActive('/') ? 'var(--teal)' : 'var(--text2)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'color 0.2s'
        }}>
          Home Gallery
        </Link>

        <Link to="/studio" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          <Sparkles size={16} />
          <span>3D AR Studio</span>
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" style={{
              color: isActive('/dashboard') ? 'var(--teal)' : 'var(--text2)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FolderKanban size={16} />
              <span>My Projects</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
                color: 'var(--teal)'
              }}>
                <User size={14} />
                <span>{user.username}</span>
              </div>

              <button
                onClick={onLogout}
                className="btn btn-danger"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '10px', marginLeft: '12px' }}>
            <Link to="/login" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              <LogIn size={14} />
              <span>Login</span>
            </Link>
            <Link to="/register" className="btn btn-purple" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              <UserPlus size={14} />
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
