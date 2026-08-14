const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createProject, getProjects, getProjectById, deleteProject, toggleFavorite } = require('../controllers/projectController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Multer Disk Storage Configuration
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max file size
});

router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProjectById);
router.post('/', authenticateToken, upload.single('image'), createProject);
router.delete('/:id', authenticateToken, deleteProject);
router.post('/:id/favorite', authenticateToken, toggleFavorite);

module.exports = router;
