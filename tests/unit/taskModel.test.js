const taskModel = require('../../src/models/taskModel');
const { pool } = require('../../src/config/database');

jest.mock('../../src/config/database');

describe('Task Model - Unit Tests', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = jest.fn();
    pool.query = mockQuery;
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should retrieve tasks with default parameters', async () => {
      const mockTasks = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Task',
          completed: false,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockTasks });

      const result = await taskModel.getTasks();

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it('should handle pagination parameters', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await taskModel.getTasks({ page: 2, limit: 20 });

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[1]).toContain(20); // limit
      expect(callArgs[1]).toContain(20); // offset (page 2 * limit 20)
    });

    it('should filter by completed status', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await taskModel.getTasks({ completed: true });

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[1]).toContain(true);
    });

    it('should handle sorting parameters', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await taskModel.getTasks({ sortBy: 'title', sortOrder: 'asc' });

      const sql = mockQuery.mock.calls[0][0];
      expect(sql).toContain('ORDER BY title asc');
    });
  });

  describe('getTaskById', () => {
    it('should retrieve a task by ID', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        completed: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      };
      mockQuery.mockResolvedValue({ rows: [mockTask] });

      const result = await taskModel.getTaskById('123e4567-e89b-12d3-a456-426614174000');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = $1',
        ['123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await taskModel.getTaskById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toBeNull();
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'New Task',
        completed: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      };
      mockQuery.mockResolvedValue({ rows: [mockTask] });

      const result = await taskModel.createTask({ title: 'New Task' });

      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING id, title, completed, created_at, updated_at',
        ['New Task', false]
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Task',
        completed: true,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T11:00:00Z',
      };
      mockQuery.mockResolvedValue({ rows: [mockTask] });

      const result = await taskModel.updateTask('123e4567-e89b-12d3-a456-426614174000', {
        title: 'Updated Task',
        completed: true,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING id, title, completed, created_at, updated_at',
        ['Updated Task', true, '123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await taskModel.updateTask('123e4567-e89b-12d3-a456-426614174000', {
        title: 'Updated Task',
        completed: true,
      });

      expect(result).toBeNull();
    });
  });

  describe('patchTaskCompleted', () => {
    it('should update completion status when provided', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        completed: true,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T11:00:00Z',
      };
      mockQuery.mockResolvedValue({ rows: [mockTask] });

      const result = await taskModel.patchTaskCompleted('123e4567-e89b-12d3-a456-426614174000', true);

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id, title, completed, created_at, updated_at',
        [true, '123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).toEqual(mockTask);
    });

    it('should toggle completion status when not provided', async () => {
      const currentTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        completed: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      };
      const updatedTask = { ...currentTask, completed: true };

      mockQuery
        .mockResolvedValueOnce({ rows: [currentTask] })
        .mockResolvedValueOnce({ rows: [updatedTask] });

      const result = await taskModel.patchTaskCompleted('123e4567-e89b-12d3-a456-426614174000', undefined);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(result.completed).toBe(true);
    });

    it('should return null if task not found when toggling', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await taskModel.patchTaskCompleted('123e4567-e89b-12d3-a456-426614174000', undefined);

      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await taskModel.deleteTask('123e4567-e89b-12d3-a456-426614174000');

      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = $1', [
        '123e4567-e89b-12d3-a456-426614174000',
      ]);
      expect(result).toBe(true);
    });

    it('should return false if task not found', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 });

      const result = await taskModel.deleteTask('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toBe(false);
    });
  });
});

