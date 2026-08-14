const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const projectRoutes = require('./src/routes/projects');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Database and Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 DepthAR Backend REST API running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
