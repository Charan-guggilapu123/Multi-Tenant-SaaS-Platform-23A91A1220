const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

// Create Project
router.post('/', authMiddleware, projectController.createProject);

// List Projects
router.get('/', authMiddleware, projectController.listProjects);

// Update Project
router.put('/:projectId', authMiddleware, projectController.updateProject);

// Delete Project
router.delete('/:projectId', authMiddleware, projectController.deleteProject);

module.exports = router;
