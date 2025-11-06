// Global teardown - runs after all tests complete
const { closePool } = require('../src/config/database');

module.exports = async () => {
  await closePool();
};

