import React from 'react';
import { Box, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg1)',
      padding: '32px',
      textAlign: 'center',
      marginTop: '60px',
      color: 'var(--text3)',
      fontSize: '0.8rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text2)' }}>
        <Box size={16} color="var(--teal)" />
        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>DepthAR 3D Platform</span>
      </div>
      <p>Convert any 2D image into interactive 3D Holograms & Augmented Reality Models.</p>
      <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text3)' }}>
        Built with React, Node.js, Express & SQLite Database • 2026
      </p>
    </footer>
  );
}
