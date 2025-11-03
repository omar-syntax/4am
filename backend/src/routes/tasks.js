const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { listTasks, createTask, assignTaskToUser, completeTask, getTaskAnalytics } = require('../controllers/tasksController');
const { validateTask } = require('../middleware/validation');

router.get('/', authMiddleware, listTasks);
router.post('/', authMiddleware, validateTask, createTask);
router.post('/assign', authMiddleware, validateTask, assignTaskToUser);
router.patch('/:id/complete', authMiddleware, completeTask);
router.get('/analytics', authMiddleware, getTaskAnalytics);

module.exports = router;
