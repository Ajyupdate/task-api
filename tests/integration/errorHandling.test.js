const request = require('supertest');
const app = require('../../src/app');

describe('Error Handling - Integration Tests', () => {
  describe('404 Not Found', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/v1/nonexistent').expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 404 for invalid API version', async () => {
      const response = await request(app).get('/api/v2/tasks').expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 with details for validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({ title: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should validate UUID format in path parameters', async () => {
      // Use PUT endpoint which validates UUID in params
      const response = await request(app)
        .put('/api/v1/tasks/invalid-uuid-format')
        .send({ title: 'Test', completed: false })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('Malformed JSON', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Express should handle this, might be 400 or 500 depending on body parser
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});

