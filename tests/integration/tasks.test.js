const request = require('supertest');
const app = require('../../src/app');
const { pool, closePool } = require('../../src/config/database');

describe('Tasks API - Integration Tests', () => {
  let createdTaskId;

  beforeAll(async () => {
    // Clean up test database
    await pool.query('DELETE FROM tasks');
  });

  afterAll(async () => {
    // Clean up test database
    await pool.query('DELETE FROM tasks');
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Integration Test Task' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Integration Test Task');
      expect(response.body.completed).toBe(false);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');

      createdTaskId = response.body.id;
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({ title: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 if title exceeds max length', async () => {
      const longTitle = 'a'.repeat(256);
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({ title: longTitle })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should retrieve all tasks', async () => {
      const response = await request(app).get('/api/v1/tasks').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('completed');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?page=1&limit=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(1);
    });

    it('should filter by completed status', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?completed=false')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((task) => {
        expect(task.completed).toBe(false);
      });
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?sortBy=created_at&sortOrder=desc')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 1) {
        const firstDate = new Date(response.body[0].created_at);
        const secondDate = new Date(response.body[1].created_at);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should retrieve a single task by ID', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/v1/tasks')
          .send({ title: 'Task to Retrieve' })
          .expect(201);
        createdTaskId = createResponse.body.id;
      }

      const response = await request(app)
        .get(`/api/v1/tasks/${createdTaskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdTaskId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('completed');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '00000000-0000-4000-8000-000000000000';
      const response = await request(app)
        .get(`/api/v1/tasks/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Task not found');
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 400 if invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/tasks/invalid-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update an existing task', async () => {
      if (!createdTaskId) {
        // Create a task first if not already created
        const createResponse = await request(app)
          .post('/api/v1/tasks')
          .send({ title: 'Task to Update' })
          .expect(201);
        createdTaskId = createResponse.body.id;
      }

      const response = await request(app)
        .put(`/api/v1/tasks/${createdTaskId}`)
        .send({ title: 'Updated Task Title', completed: true })
        .expect(200);

      expect(response.body.title).toBe('Updated Task Title');
      expect(response.body.completed).toBe(true);
      expect(response.body.id).toBe(createdTaskId);
    });

    it('should return 404 for non-existent task', async () => {
      // Use a valid UUID v4 format that doesn't exist
      const fakeId = '00000000-0000-4000-8000-000000000000';
      const response = await request(app)
        .put(`/api/v1/tasks/${fakeId}`)
        .send({ title: 'Updated Title', completed: true })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 400 if validation fails', async () => {
      if (!createdTaskId) return;

      const response = await request(app)
        .put(`/api/v1/tasks/${createdTaskId}`)
        .send({ title: '', completed: true })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 if invalid UUID format', async () => {
      const response = await request(app)
        .put('/api/v1/tasks/invalid-uuid')
        .send({ title: 'Valid Title', completed: true })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('PATCH /api/v1/tasks/:id/completed', () => {
    it('should toggle completion status when body is empty', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/v1/tasks')
          .send({ title: 'Task to Toggle' })
          .expect(201);
        createdTaskId = createResponse.body.id;
      }

      // Get current status
      const beforeResponse = await request(app)
        .get('/api/v1/tasks')
        .expect(200);
      const task = beforeResponse.body.find((t) => t.id === createdTaskId);
      const originalStatus = task ? task.completed : false;

      // Toggle
      const response = await request(app)
        .patch(`/api/v1/tasks/${createdTaskId}/completed`)
        .send({})
        .expect(200);

      expect(response.body.completed).toBe(!originalStatus);
    });

    it('should set completion status when provided', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/v1/tasks')
          .send({ title: 'Task to Set' })
          .expect(201);
        createdTaskId = createResponse.body.id;
      }

      const response = await request(app)
        .patch(`/api/v1/tasks/${createdTaskId}/completed`)
        .send({ completed: false })
        .expect(200);

      expect(response.body.completed).toBe(false);
    });

    it('should return 404 for non-existent task', async () => {
      // Use a valid UUID v4 format that doesn't exist
      const fakeId = '00000000-0000-4000-8000-000000000000';
      const response = await request(app)
        .patch(`/api/v1/tasks/${fakeId}/completed`)
        .send({ completed: true })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete an existing task', async () => {
      // Create a task to delete
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Task to Delete' })
        .expect(201);
      const taskIdToDelete = createResponse.body.id;

      await request(app).delete(`/api/v1/tasks/${taskIdToDelete}`).expect(204);

      // Verify it's deleted
      const getResponse = await request(app)
        .get('/api/v1/tasks')
        .expect(200);
      const deletedTask = getResponse.body.find((t) => t.id === taskIdToDelete);
      expect(deletedTask).toBeUndefined();
    });

    it('should return 404 for non-existent task', async () => {
      // Use a valid UUID v4 format that doesn't exist
      const fakeId = '00000000-0000-4000-8000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/tasks/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 400 if invalid UUID format', async () => {
      const response = await request(app)
        .delete('/api/v1/tasks/invalid-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });
});

