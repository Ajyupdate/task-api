const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  patchTaskCompleted,
  deleteTask,
} = require('../models/taskModel');
const { asyncHandler } = require('../utils/asyncHandler');

const listTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, completed, sortBy, sortOrder } = req.query;
  const tasks = await getTasks({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    completed: typeof completed === 'string' ? completed === 'true' : undefined,
    sortBy,
    sortOrder,
  });
  res.status(200).json(tasks);
});

const getTaskController = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const task = await getTaskById(id);
  if (!task) return next({ statusCode: 404, message: 'Task not found' });
  res.status(200).json(task);
});

const createTaskController = asyncHandler(async (req, res) => {
  const task = await createTask({ title: req.body.title });
  res.status(201).json(task);
});

const updateTaskController = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updated = await updateTask(id, { title: req.body.title, completed: req.body.completed });
  if (!updated) return next({ statusCode: 404, message: 'Task not found' });
  res.status(200).json(updated);
});

const patchCompletedController = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updated = await patchTaskCompleted(id, req.body.completed);
  if (!updated) return next({ statusCode: 404, message: 'Task not found' });
  res.status(200).json(updated);
});

const deleteTaskController = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const ok = await deleteTask(id);
  if (!ok) return next({ statusCode: 404, message: 'Task not found' });
  res.status(204).send();
});

module.exports = {
  listTasks,
  getTaskController,
  createTaskController,
  updateTaskController,
  patchCompletedController,
  deleteTaskController,
};

