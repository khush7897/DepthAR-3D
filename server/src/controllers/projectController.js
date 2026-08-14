const { run, get, all } = require('../config/db');

async function createProject(req, res) {
  try {
    const { title, description, depth_map_data, labels_json, mesh_settings_json, is_public } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let original_image_path = req.body.original_image_path || '';
    if (req.file) {
      original_image_path = `/uploads/${req.file.filename}`;
    }

    const result = await run(
      `INSERT INTO projects (user_id, title, description, original_image_path, depth_map_data, labels_json, mesh_settings_json, is_public)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        description || '',
        original_image_path,
        typeof depth_map_data === 'object' ? JSON.stringify(depth_map_data) : depth_map_data || '',
        typeof labels_json === 'object' ? JSON.stringify(labels_json) : labels_json || '[]',
        typeof mesh_settings_json === 'object' ? JSON.stringify(mesh_settings_json) : mesh_settings_json || '{}',
        is_public !== undefined ? Number(is_public) : 1
      ]
    );

    const newProject = await get('SELECT * FROM projects WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

async function getProjects(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const filter = req.query.filter; // 'my' or 'public'

    let projects = [];
    if (filter === 'my' && userId) {
      projects = await all(
        `SELECT p.*, u.username as author_name, 
          (SELECT COUNT(*) FROM favorites f WHERE f.project_id = p.id) as favorites_count,
          (SELECT COUNT(*) FROM favorites f WHERE f.project_id = p.id AND f.user_id = ?) as is_favorited
         FROM projects p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ?
         ORDER BY p.created_at DESC`,
        [userId, userId]
      );
    } else {
      projects = await all(
        `SELECT p.*, u.username as author_name,
          (SELECT COUNT(*) FROM favorites f WHERE f.project_id = p.id) as favorites_count,
          (SELECT COUNT(*) FROM favorites f WHERE f.project_id = p.id AND f.user_id = ?) as is_favorited
         FROM projects p
         JOIN users u ON p.user_id = u.id
         WHERE p.is_public = 1 ${userId ? 'OR p.user_id = ' + userId : ''}
         ORDER BY p.created_at DESC`,
        [userId || 0]
      );
    }

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 0;

    const project = await get(
      `SELECT p.*, u.username as author_name,
        (SELECT COUNT(*) FROM favorites f WHERE f.project_id = p.id) as favorites_count,
        (SELECT COUNT(*) FROM favorites f WHERE f.project_id = p.id AND f.user_id = ?) as is_favorited
       FROM projects p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [userId, id]
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const project = await get('SELECT * FROM projects WHERE id = ?', [id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this project' });
    }

    await run('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

async function toggleFavorite(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await get('SELECT * FROM favorites WHERE user_id = ? AND project_id = ?', [userId, id]);

    if (existing) {
      await run('DELETE FROM favorites WHERE user_id = ? AND project_id = ?', [userId, id]);
      return res.json({ favorited: false });
    } else {
      await run('INSERT INTO favorites (user_id, project_id) VALUES (?, ?)', [userId, id]);
      return res.json({ favorited: true });
    }
  } catch (error) {
    console.error('Favorite error:', error);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  toggleFavorite
};
