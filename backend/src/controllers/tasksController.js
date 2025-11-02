const dbModule = require('../models/db');

async function listTasks(req, res) {
  try {
    const userId = req.userId;
    if (process.env.DATABASE_URL) {
      const result = await dbModule.query('SELECT id,title,description,created_at FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      res.json({ tasks: result.rows });
    } else {
      const rows = await dbModule.allAsync('SELECT id,title,description,created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      res.json({ tasks: rows });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function createTask(req, res) {
  try {
    const { title, description } = req.body;
    const userId = req.userId;
    if (!title) return res.status(400).json({ error: 'title required' });
    if (process.env.DATABASE_URL) {
      const result = await dbModule.query('INSERT INTO tasks(user_id,title,description) VALUES($1,$2,$3) RETURNING id,title,description,created_at', [userId, title, description || null]);
      res.json({ task: result.rows[0] });
    } else {
      const info = await dbModule.runAsync('INSERT INTO tasks(user_id,title,description) VALUES(?,?,?)', [userId, title, description || null]);
      const id = info.lastID;
      const task = await dbModule.getAsync('SELECT id,title,description,created_at FROM tasks WHERE id = ?', [id]);
      res.json({ task });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

module.exports = { listTasks, createTask };
