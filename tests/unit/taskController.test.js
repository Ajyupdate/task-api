const {
  listTasks,
  getTaskController,
  createTaskController,
  updateTaskController,
  patchCompletedController,
  deleteTaskController,
} = require('../../src/controllers/taskController');
const taskModel = require('../../src/models/taskModel');

// Mock the task model
jest.mock('../../src/models/taskModel');

describe('Task Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('listTasks', () => {
    it('should return list of tasks with default pagination', async () => {
      const mockTasks = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Task',
          completed: false,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
      ];
      taskModel.getTasks.mockResolvedValue(mockTasks);
      req.query = { page: 1, limit: 10 };

      await listTasks(req, res, next);

      expect(taskModel.getTasks).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        completed: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should handle query parameters correctly', async () => {
      const mockTasks = [];
      taskModel.getTasks.mockResolvedValue(mockTasks);
      req.query = {
        page: 2,
        limit: 20,
        completed: 'true',
        sortBy: 'title',
        sortOrder: 'asc',
      };

      await listTasks(req, res, next);

      expect(taskModel.getTasks).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        completed: true,
        sortBy: 'title',
        sortOrder: 'asc',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTasks);
    });
  });

  describe('getTaskController', () => {
    it('should retrieve a task by ID', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        completed: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      };
      taskModel.getTaskById.mockResolvedValue(mockTask);
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      await getTaskController(req, res, next);

      expect(taskModel.getTaskById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with 404 if task not found', async () => {
      taskModel.getTaskById.mockResolvedValue(null);
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      await getTaskController(req, res, next);

      expect(taskModel.getTaskById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'Task not found',
      });
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('createTaskController', () => {
    it('should create a new task', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'New Task',
        completed: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      };
      taskModel.createTask.mockResolvedValue(mockTask);
      req.body = { title: 'New Task' };

      await createTaskController(req, res, next);

      expect(taskModel.createTask).toHaveBeenCalledWith({ title: 'New Task' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('updateTaskController', () => {
    it('should update an existing task', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Task',
        completed: true,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T11:00:00Z',
      };
      taskModel.updateTask.mockResolvedValue(mockTask);
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      req.body = { title: 'Updated Task', completed: true };

      await updateTaskController(req, res, next);

      expect(taskModel.updateTask).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { title: 'Updated Task', completed: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with 404 if task not found', async () => {
      taskModel.updateTask.mockResolvedValue(null);
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      req.body = { title: 'Updated Task', completed: true };

      await updateTaskController(req, res, next);

      expect(taskModel.updateTask).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'Task not found',
      });
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('patchCompletedController', () => {
    it('should update completion status', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        completed: true,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T11:00:00Z',
      };
      taskModel.patchTaskCompleted.mockResolvedValue(mockTask);
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      req.body = { completed: true };

      await patchCompletedController(req, res, next);

      expect(taskModel.patchTaskCompleted).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        true
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with 404 if task not found', async () => {
      taskModel.patchTaskCompleted.mockResolvedValue(null);
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      req.body = { completed: true };

      await patchCompletedController(req, res, next);

      expect(taskModel.patchTaskCompleted).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'Task not found',
      });
    });
  });

  describe('deleteTaskController', () => {
    it('should delete a task successfully', async () => {
      taskModel.deleteTask.mockResolvedValue(true);
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      await deleteTaskController(req, res, next);

      expect(taskModel.deleteTask).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with 404 if task not found', async () => {
      taskModel.deleteTask.mockResolvedValue(false);
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      await deleteTaskController(req, res, next);

      expect(taskModel.deleteTask).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'Task not found',
      });
    });
  });
});

