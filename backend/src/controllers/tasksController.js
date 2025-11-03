const dbModule = require('../models/db');

async function listTasks(req, res) {
  try {
    const userId = req.userId;
    const { week_start } = req.query;
    const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://');
    const isMySQL = process.env.MYSQL_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://'));

    if (isPostgres) {
      const params = [userId];
      let where = 'WHERE user_id = $1';
      if (week_start) { where += ' AND week_start = $2'; params.push(week_start); }
      const result = await dbModule.query(`SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks ${where} ORDER BY created_at DESC`, params);
      res.json({ tasks: result.rows });
    } else if (isMySQL) {
      const params = [userId];
      let where = 'WHERE user_id = ?';
      if (week_start) { where += ' AND week_start = ?'; params.push(week_start); }
      const rows = await dbModule.allAsync(`SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks ${where} ORDER BY created_at DESC`, params);
      res.json({ tasks: rows });
    } else {
      const params = [userId];
      let where = 'WHERE user_id = ?';
      if (week_start) { where += ' AND week_start = ?'; params.push(week_start); }
      const rows = await dbModule.allAsync(`SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks ${where} ORDER BY created_at DESC`, params);
      res.json({ tasks: rows });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function createTask(req, res) {
  try {
    const { title, description, week_start } = req.body;
    const userId = req.userId;
    if (!title) return res.status(400).json({ error: 'title required' });
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
      const result = await dbModule.query('INSERT INTO tasks(user_id,title,description,week_start) VALUES($1,$2,$3,$4) RETURNING id,title,description,status,week_start,assigned_by,created_at,completed_at', [userId, title, description || null, week_start || null]);
      res.json({ task: result.rows[0] });
    } else if (process.env.MYSQL_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://'))) {
      const info = await dbModule.runAsync('INSERT INTO tasks(user_id,title,description,week_start) VALUES(?,?,?,?)', [userId, title, description || null, week_start || null]);
      const id = info.lastID;
      const task = await dbModule.getAsync('SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks WHERE id = ?', [id]);
      res.json({ task });
    } else {
      const info = await dbModule.runAsync('INSERT INTO tasks(user_id,title,description,week_start) VALUES(?,?,?,?)', [userId, title, description || null, week_start || null]);
      const id = info.lastID;
      const task = await dbModule.getAsync('SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks WHERE id = ?', [id]);
      res.json({ task });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function assignTaskToUser(req, res) {
  try {
    const adminId = req.userId;
    const { user_id, title, description, week_start } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    if (!title) return res.status(400).json({ error: 'title required' });

    // authorize admin
    const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://');
    const isMySQL = process.env.MYSQL_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://'));
    let currentUser;
    if (isPostgres) {
      const result = await dbModule.query('SELECT user_type FROM users WHERE id = $1', [adminId]);
      currentUser = result.rows[0];
    } else if (isMySQL) {
      currentUser = await dbModule.getAsync('SELECT user_type FROM users WHERE id = ?', [adminId]);
    } else {
      currentUser = await dbModule.getAsync('SELECT user_type FROM users WHERE id = ?', [adminId]);
    }
    if (!currentUser || currentUser.user_type !== 'admin') {
      return res.status(403).json({ error: 'forbidden - admin access required' });
    }

    if (isPostgres) {
      const result = await dbModule.query(
        'INSERT INTO tasks(user_id,title,description,week_start,assigned_by) VALUES($1,$2,$3,$4,$5) RETURNING id,title,description,status,week_start,assigned_by,created_at,completed_at',
        [user_id, title, description || null, week_start || null, adminId]
      );
      res.json({ task: result.rows[0] });
    } else if (isMySQL) {
      const info = await dbModule.runAsync('INSERT INTO tasks(user_id,title,description,week_start,assigned_by) VALUES(?,?,?,?,?)', [user_id, title, description || null, week_start || null, adminId]);
      const id = info.lastID;
      const task = await dbModule.getAsync('SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks WHERE id = ?', [id]);
      res.json({ task });
    } else {
      const info = await dbModule.runAsync('INSERT INTO tasks(user_id,title,description,week_start,assigned_by) VALUES(?,?,?,?,?)', [user_id, title, description || null, week_start || null, adminId]);
      const id = info.lastID;
      const task = await dbModule.getAsync('SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks WHERE id = ?', [id]);
      res.json({ task });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function completeTask(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://');
    const isMySQL = process.env.MYSQL_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://'));

    // ensure task belongs to user
    let task;
    if (isPostgres) {
      const t = await dbModule.query('SELECT id,user_id FROM tasks WHERE id = $1', [id]);
      task = t.rows[0];
    } else {
      task = await dbModule.getAsync('SELECT id,user_id FROM tasks WHERE id = ?', [id]);
    }
    if (!task || task.user_id !== Number(userId)) return res.status(404).json({ error: 'not found' });

    if (isPostgres) {
      await dbModule.query('UPDATE tasks SET status = $1, completed_at = NOW() WHERE id = $2', ['completed', id]);
      const result = await dbModule.query('SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks WHERE id = $1', [id]);
      res.json({ task: result.rows[0] });
    } else if (isMySQL) {
      await dbModule.runAsync('UPDATE tasks SET status = ?, completed_at = NOW() WHERE id = ?', ['completed', id]);
      const updated = await dbModule.getAsync('SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks WHERE id = ?', [id]);
      res.json({ task: updated });
    } else {
      await dbModule.runAsync('UPDATE tasks SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?', ['completed', id]);
      const updated = await dbModule.getAsync('SELECT id,title,description,status,week_start,assigned_by,created_at,completed_at FROM tasks WHERE id = ?', [id]);
      res.json({ task: updated });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function getTaskAnalytics(req, res) {
  try {
    const adminId = req.userId;
    const { week_start } = req.query;
    const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://');
    const isMySQL = process.env.MYSQL_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://'));

    // authorize admin
    let currentUser;
    if (isPostgres) {
      const result = await dbModule.query('SELECT user_type FROM users WHERE id = $1', [adminId]);
      currentUser = result.rows[0];
    } else if (isMySQL) {
      currentUser = await dbModule.getAsync('SELECT user_type FROM users WHERE id = ?', [adminId]);
    } else {
      currentUser = await dbModule.getAsync('SELECT user_type FROM users WHERE id = ?', [adminId]);
    }
    if (!currentUser || currentUser.user_type !== 'admin') {
      return res.status(403).json({ error: 'forbidden - admin access required' });
    }

    // overall counts
    let totals = { assigned: 0, completed: 0, completion_rate: 0 };
    let perUser = [];
    if (isPostgres) {
      const params = [];
      let where = '';
      if (week_start) { where = 'WHERE week_start = $1'; params.push(week_start); }
      const assigned = await dbModule.query(`SELECT COUNT(*)::int AS c FROM tasks ${where}`, params);
      const completed = await dbModule.query(`SELECT COUNT(*)::int AS c FROM tasks ${where ? where + ' AND' : 'WHERE'} status = 'completed'`, params);
      totals.assigned = assigned.rows[0].c; totals.completed = completed.rows[0].c; totals.completion_rate = totals.assigned ? Math.round((totals.completed / totals.assigned) * 100) : 0;
      const per = await dbModule.query(`
        SELECT u.id as user_id, u.name, 
               COUNT(t.id)::int AS assigned,
               SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END)::int AS completed
        FROM users u
        LEFT JOIN tasks t ON t.user_id = u.id ${week_start ? 'AND t.week_start = $1' : ''}
        GROUP BY u.id, u.name
        ORDER BY u.name ASC
      `, params);
      perUser = per.rows.map(r => ({ ...r, completion_rate: r.assigned ? Math.round((r.completed / r.assigned) * 100) : 0 }));
    } else if (isMySQL) {
      const params = [];
      let where = '';
      if (week_start) { where = 'WHERE week_start = ?'; params.push(week_start); }
      const assigned = await dbModule.getAsync(`SELECT COUNT(*) AS c FROM tasks ${where}`, params);
      const completed = await dbModule.getAsync(`SELECT COUNT(*) AS c FROM tasks ${where ? where + ' AND' : 'WHERE'} status = 'completed'`, params);
      totals.assigned = assigned.c; totals.completed = completed.c; totals.completion_rate = totals.assigned ? Math.round((totals.completed / totals.assigned) * 100) : 0;
      const per = await dbModule.allAsync(`
        SELECT u.id as user_id, u.name,
               COUNT(t.id) AS assigned,
               SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed
        FROM users u
        LEFT JOIN tasks t ON t.user_id = u.id ${week_start ? 'AND t.week_start = ?' : ''}
        GROUP BY u.id, u.name
        ORDER BY u.name ASC
      `, params);
      perUser = per.map(r => ({ ...r, completion_rate: r.assigned ? Math.round((r.completed / r.assigned) * 100) : 0 }));
    } else {
      const params = [];
      let where = '';
      if (week_start) { where = 'WHERE week_start = ?'; params.push(week_start); }
      const assigned = await dbModule.getAsync(`SELECT COUNT(*) AS c FROM tasks ${where}`, params);
      const completed = await dbModule.getAsync(`SELECT COUNT(*) AS c FROM tasks ${where ? where + ' AND' : 'WHERE'} status = 'completed'`, params);
      totals.assigned = assigned.c; totals.completed = completed.c; totals.completion_rate = totals.assigned ? Math.round((totals.completed / totals.assigned) * 100) : 0;
      const per = await dbModule.allAsync(`
        SELECT u.id as user_id, u.name,
               COUNT(t.id) AS assigned,
               SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed
        FROM users u
        LEFT JOIN tasks t ON t.user_id = u.id ${week_start ? 'AND t.week_start = ?' : ''}
        GROUP BY u.id, u.name
        ORDER BY u.name ASC
      `, params);
      perUser = per.map(r => ({ ...r, completion_rate: r.assigned ? Math.round((r.completed / r.assigned) * 100) : 0 }));
    }

    res.json({ totals, perUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

module.exports = { listTasks, createTask, assignTaskToUser, completeTask, getTaskAnalytics };
