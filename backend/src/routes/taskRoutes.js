const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Create Task
router.post('/projects/:projectId/tasks', authMiddleware, taskController.createTask);

// List Project Tasks
router.get('/projects/:projectId/tasks', authMiddleware, taskController.listTasks);

// Update Task
router.put('/tasks/:taskId', authMiddleware, taskController.updateTask);

// Update Task Status
router.patch('/tasks/:taskId/status', authMiddleware, taskController.updateTaskStatus);

// Delete Task
router.delete('/tasks/:taskId', authMiddleware, taskController.deleteTask);

module.exports = router;
