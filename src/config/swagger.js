const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'Production-ready Task Management REST API with Node.js, Express, and PostgreSQL',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          required: ['id', 'title', 'completed', 'created_at', 'updated_at'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the task',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Task title',
              example: 'Complete project documentation',
            },
            completed: {
              type: 'boolean',
              description: 'Task completion status',
              example: false,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Task creation timestamp',
              example: '2024-01-15T10:30:00Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Task last update timestamp',
              example: '2024-01-15T10:30:00Z',
            },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Task title',
              example: 'Complete project documentation',
            },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          required: ['title', 'completed'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Task title',
              example: 'Complete project documentation',
            },
            completed: {
              type: 'boolean',
              description: 'Task completion status',
              example: true,
            },
          },
        },
        PatchCompletedRequest: {
          type: 'object',
          properties: {
            completed: {
              type: 'boolean',
              description: 'Task completion status (optional - toggles if not provided)',
              example: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation error',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
              example: 400,
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  path: { type: 'array', items: { type: 'string' } },
                },
              },
              description: 'Validation error details (optional)',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ok',
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
              example: 1234.56,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

