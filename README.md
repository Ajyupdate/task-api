# Task API

Task Management REST API built with Node.js, Express, and PostgreSQL.

## Features

- CRUD for tasks with proper HTTP status codes
- Input validation (Joi) and consistent error responses
- PostgreSQL with connection pooling and parameterized queries
- Centralized error handling and async wrapper
- Request logging (morgan), security headers (helmet), CORS, and rate limiting
- Health check endpoint at `/api/health`
- Versioned API under `/api/v1`
- Pagination, filtering, and sorting for listing tasks
- Graceful shutdown and DB connection verification on startup
- **Swagger/OpenAPI documentation** at `/api-docs`
- **Comprehensive test suite** with unit and integration tests

## Prerequisites

- Node.js >= 18
- PostgreSQL 13+

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create a `.env` file at the project root using the template below:

```
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=task_manager
DB_SSL=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 3) Database setup

Run the SQL in `schema.sql` inside your PostgreSQL instance. Example using psql:

```bash
psql -h localhost -U postgres -f schema.sql
```

If needed, create the database first:

```sql
-- CREATE DATABASE task_manager;
-- \c task_manager
```

The schema uses `pgcrypto` for `gen_random_uuid()`.

### 4) Run the server

```bash
npm run dev
# or
npm start
```

Server: `http://localhost:4000`

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:4000/api-docs`

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive testing interface
- Example requests and responses

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Test Structure

- **Unit Tests** (`tests/unit/`): Test controllers and models in isolation
- **Integration Tests** (`tests/integration/`): Test API endpoints end-to-end

### Test Database Setup

For integration tests, you can use either:
1. **Separate test database** (recommended): Create `task_manager_test` database
2. **Same database**: Tests will use `task_manager` if test DB doesn't exist

To set up a separate test database:

```bash
# Create the test database
createdb task_manager_test

# Or using psql
psql -U postgres -c "CREATE DATABASE task_manager_test;"

# Run the schema on the test database
psql -h localhost -U postgres -d task_manager_test -f schema.test.sql
```

Alternatively, you can set `DB_NAME` environment variable to specify which database to use:
```bash
DB_NAME=task_manager npm test
```

### Test Coverage

The project includes comprehensive tests covering:
- All CRUD operations
- Input validation
- Error handling
- Edge cases
- Database operations

## API

Base: `/api/v1`

- GET `/api/health` → 200 `{ "status": "ok", "uptime": <number> }`

### Tasks

- GET `/tasks` → 200 `Task[]` (supports `page`, `limit`, `completed`, `sortBy`, `sortOrder`)
- GET `/tasks/:id` → 200 `Task` | 404 Not Found
- POST `/tasks` body `{ "title": "Task title" }` → 201 `Task`
- PUT `/tasks/:id` body `{ "title": "Updated", "completed": true }` → 200 `Task`
- PATCH `/tasks/:id/completed` body `{ "completed": true }` (optional) → 200 `Task`
- DELETE `/tasks/:id` → 204

### Error format

```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": []
}
```

## cURL examples

```bash
curl -s http://localhost:4000/api/health | jq
curl -s -X POST http://localhost:4000/api/v1/tasks -H 'Content-Type: application/json' -d '{"title":"My first task"}' | jq
curl -s 'http://localhost:4000/api/v1/tasks?limit=10&page=1' | jq
curl -s http://localhost:4000/api/v1/tasks/TASK_ID | jq
curl -s -X PUT http://localhost:4000/api/v1/tasks/TASK_ID -H 'Content-Type: application/json' -d '{"title":"Updated","completed":true}' | jq
curl -s -X PATCH http://localhost:4000/api/v1/tasks/TASK_ID/completed | jq
curl -s -X DELETE http://localhost:4000/api/v1/tasks/TASK_ID -i
```

## Structure

```
src/
  config/database.js
  controllers/taskController.js
  routes/taskRoutes.js
  models/taskModel.js
  middleware/errorHandler.js
  middleware/validateTask.js
  utils/asyncHandler.js
  app.js
schema.sql
```


