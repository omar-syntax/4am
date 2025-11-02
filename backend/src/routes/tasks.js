const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { listTasks, createTask } = require('../controllers/tasksController');
const { validateTask } = require('../middleware/validation');

router.get('/', authMiddleware, listTasks);
router.post('/', authMiddleware, validateTask, createTask);

module.exports = router;
