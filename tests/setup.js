// Global test setup
process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
// Use test database for tests (can be overridden with DB_NAME env var)
// Defaults to task_manager_test, falls back to task_manager if test DB doesn't exist
if (!process.env.DB_NAME) {
  process.env.DB_NAME = 'task_manager_test';
}

// Increase timeout for integration tests
jest.setTimeout(10000);

