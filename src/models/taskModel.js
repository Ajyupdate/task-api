const { pool } = require('../config/database');

async function getTasks({ page = 1, limit = 50, completed, sortBy = 'created_at', sortOrder = 'desc' } = {}) {
  const offset = (page - 1) * limit;

  const validSortBy = new Set(['created_at', 'updated_at', 'title']);
  const validSortOrder = new Set(['asc', 'desc']);
  const orderBy = validSortBy.has(sortBy) ? sortBy : 'created_at';
  const direction = validSortOrder.has(String(sortOrder).toLowerCase()) ? sortOrder : 'desc';

  const values = [];
  const where = [];
  if (typeof completed === 'boolean') {
    values.push(completed);
    where.push(`completed = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  values.push(limit);
  values.push(offset);

  const sql = `
    SELECT id, title, completed, created_at, updated_at
    FROM tasks
    ${whereSql}
    ORDER BY ${orderBy} ${direction}
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
}

async function getTaskById(id) {
  const { rows } = await pool.query(
    'SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createTask({ title }) {
  const { rows } = await pool.query(
    'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING id, title, completed, created_at, updated_at',
    [title, false]
  );
  return rows[0];
}

async function updateTask(id, { title, completed }) {
  const { rows } = await pool.query(
    'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING id, title, completed, created_at, updated_at',
    [title, completed, id]
  );
  return rows[0] || null;
}

async function patchTaskCompleted(id, completed) {
  let nextCompleted = completed;
  if (typeof nextCompleted !== 'boolean') {
    // Toggle if not provided
    const current = await getTaskById(id);
    if (!current) return null;
    nextCompleted = !current.completed;
  }
  const { rows } = await pool.query(
    'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id, title, completed, created_at, updated_at',
    [nextCompleted, id]
  );
  return rows[0] || null;
}

async function deleteTask(id) {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  patchTaskCompleted,
  deleteTask,
};

